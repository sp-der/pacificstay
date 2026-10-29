const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const ts = require("typescript");

function loadTs(file, injected = {}) {
  const compiled = ts.transpileModule(fs.readFileSync(file, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2021 },
    fileName: file,
  }).outputText;
  const module = { exports: {} };
  const context = {
    module,
    exports: module.exports,
    require: injected.require ?? (() => { throw Error("Unexpected import in " + file); }),
    process: { env: injected.env ?? {} },
    fetch: injected.fetch,
    Number,
    String,
    Boolean,
    RegExp,
    URL,
    console,
  };
  vm.runInNewContext(compiled, context, { filename: file });
  return module.exports;
}

function hostaway(env = {}) {
  return loadTs("lib/hostaway.ts", { env });
}
function destinations(env = {}) {
  const hostawayModule = hostaway(env);
  return loadTs("lib/bookingDestinations.ts", {
    require: (id) => id === "./hostaway" ? hostawayModule : (() => { throw Error(id); })(),
  });
}

test("Beach Baby Hostaway URL and listing ID are verified", () => {
  const h = hostaway();
  assert.equal(h.HOSTAWAY_BOOKING_BASE_URL, "https://pacificstayproperties.holidayfuture.com/");
  assert.equal(h.getHostawayListingId("beach-baby-oceanfront-escape"), 591608);
  assert.equal(h.getHostawayListingId("chestnut-by-the-sea"), undefined);
  assert.equal(h.getHostawayListingId("casa-del-cactus"), undefined);
});

test("Future Hostaway migration IDs only accept positive integers", () => {
  const h = hostaway({ NEXT_PUBLIC_HOSTAWAY_CASA_LISTING_ID: "123456", NEXT_PUBLIC_HOSTAWAY_CHESTNUT_LISTING_ID: "98765" });
  assert.equal(h.getHostawayListingId("casa-del-cactus"), 123456);
  assert.equal(h.getHostawayListingId("chestnut-by-the-sea"), 98765);
  const invalid = hostaway({ NEXT_PUBLIC_HOSTAWAY_CASA_LISTING_ID: "0;rm -rf /", NEXT_PUBLIC_HOSTAWAY_CHESTNUT_LISTING_ID: "-1" });
  assert.equal(invalid.getHostawayListingId("casa-del-cactus"), undefined);
  assert.equal(invalid.getHostawayListingId("chestnut-by-the-sea"), undefined);
});

test("Casa falls back to Airbnb until the native engine is enabled", () => {
  const d = destinations();
  assert.equal(d.getExternalBookingUrl("casa-del-cactus", false), "https://www.airbnb.com/rooms/1798660872755121079");
  assert.equal(d.getExternalBookingUrl("casa-del-cactus", true), null);
  assert.equal(d.getExternalBookingUrl("beach-baby-oceanfront-escape"), null);
  assert.equal(d.getExternalBookingUrl("chestnut-by-the-sea"), null);
});

test("Casa defers to Hostaway when it is explicitly migrated", () => {
  const d = destinations({ NEXT_PUBLIC_HOSTAWAY_CASA_LISTING_ID: "456789" });
  assert.equal(d.getExternalBookingUrl("casa-del-cactus", false), null);
});

async function readiness(rows, ok = true) {
  const mod = loadTs("lib/server/bookingReadiness.ts", {
    require: (id) => {
      if (id === "server-only") return {};
      if (id === "../supabaseConfig") return { SUPABASE_URL: "https://example.supabase.co", supabaseHeaders: () => ({ apikey: "test-publishable" }) };
      throw Error(id);
    },
    fetch: async (url) => {
      assert.match(url, /slug=eq\.casa-del-cactus/);
      return { ok, json: async () => rows };
    },
  });
  return mod.getCasaBookingReadiness();
}

const valid = {
  id: "property-id", active: true, min_nights: 2, max_nights: 30,
  base_nightly_rate: 180, content: { directBookingEnabled: true },
};

test("Casa booking readiness fails closed when no active database listing exists", async () => {
  assert.equal((await readiness([])).ready, false);
  assert.equal((await readiness([], false)).ready, false);
});

test("Casa booking readiness requires a positive rate and verified owner approval", async () => {
  assert.equal((await readiness([{ ...valid, base_nightly_rate: null }])).ready, false);
  assert.equal((await readiness([{ ...valid, base_nightly_rate: 0 }])).ready, false);
  assert.equal((await readiness([{ ...valid, content: { directBookingEnabled: false } }])).ready, false);
  assert.equal((await readiness([{ ...valid, max_nights: 1 }])).ready, false);
});

test("Casa booking readiness becomes ready only with full owner setup", async () => {
  const result = await readiness([valid]);
  assert.equal(result.ready, true);
  assert.equal(result.reason, "ready");
});
