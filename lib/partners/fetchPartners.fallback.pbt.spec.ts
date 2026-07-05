import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { fetchPartners } from './fetchPartners';
import { FALLBACK_PARTNERS } from './fallback';

/**
 * Property 11: Fallback correctness on failure
 *
 * For all fetch outcomes that are NOT a successful, well-formed `2xx` array
 * response, `fetchPartners` resolves to exactly `FALLBACK_PARTNERS` (no
 * partial or corrupted merge of failed-fetch data).
 *
 * **Validates: Requirements 6.3**
 */

/** Builds a mock `Response`-like object with a given status and `.json()` behavior. */
function makeResponse(status: number, jsonImpl: () => Promise<unknown>) {
  return { status, json: jsonImpl } as Response;
}

// Arbitrary: a non-2xx status code (below 200 or above 299), restricted to a
// realistic HTTP status range.
const nonSuccessStatusArb = fc.oneof(
  fc.integer({ min: 100, max: 199 }),
  fc.integer({ min: 300, max: 599 })
);

// Arbitrary: a 2xx status code.
const successStatusArb = fc.integer({ min: 200, max: 299 });

// Arbitrary: a malformed (non-array) JSON body — string, number, boolean,
// plain object, or null. These are values that, when returned by a 2xx
// response's `.json()`, must NOT be treated as partner data.
const malformedBodyArb = fc.oneof(
  fc.string(),
  fc.integer(),
  fc.boolean(),
  fc.constant(null),
  fc.dictionary(fc.string(), fc.string())
);

// Arbitrary: one of three distinct failure scenario "shapes".
type FailureScenario =
  | { kind: 'non2xx'; status: number }
  | { kind: 'malformedBody'; status: number; body: unknown }
  | { kind: 'jsonRejects'; status: number }
  | { kind: 'fetchThrows' };

const failureScenarioArb: fc.Arbitrary<FailureScenario> = fc.oneof(
  nonSuccessStatusArb.map((status): FailureScenario => ({ kind: 'non2xx', status })),
  fc
    .tuple(successStatusArb, malformedBodyArb)
    .map(([status, body]): FailureScenario => ({ kind: 'malformedBody', status, body })),
  successStatusArb.map((status): FailureScenario => ({ kind: 'jsonRejects', status })),
  fc.constant<FailureScenario>({ kind: 'fetchThrows' })
);

function buildMockFetch(scenario: FailureScenario): typeof fetch {
  switch (scenario.kind) {
    case 'non2xx':
      return (async () => makeResponse(scenario.status, async () => null)) as typeof fetch;
    case 'malformedBody':
      return (async () =>
        makeResponse(scenario.status, async () => scenario.body)) as typeof fetch;
    case 'jsonRejects':
      return (async () =>
        makeResponse(scenario.status, async () => {
          throw new Error('body is not valid JSON');
        })) as typeof fetch;
    case 'fetchThrows':
      return (async () => {
        throw new Error('network error');
      }) as typeof fetch;
  }
}

describe('fetchPartners — Property 11: fallback correctness on failure', () => {
  it('resolves to exactly FALLBACK_PARTNERS for any non-2xx-well-formed-array outcome', async () => {
    await fc.assert(
      fc.asyncProperty(failureScenarioArb, async (scenario) => {
        const mockFetch = buildMockFetch(scenario);

        const result = await fetchPartners({ fetch: mockFetch });

        // Reference/deep equality against the actual FALLBACK_PARTNERS constant
        // (generic against its current contents, not hardcoded to `[]`).
        expect(result).toEqual(FALLBACK_PARTNERS);

        // No partial/merged data from the failed attempt: every element of the
        // result must originate from FALLBACK_PARTNERS, never from a malformed
        // body value that happened to be generated.
        expect(result.length).toBe(FALLBACK_PARTNERS.length);
        for (const item of result) {
          expect(FALLBACK_PARTNERS).toContainEqual(item);
        }
      }),
      { numRuns: 100 }
    );
  });

  it('sanity check: given the current empty FALLBACK_PARTNERS, failures resolve to []', async () => {
    // This assertion is deliberately concrete (not generic) to catch the case
    // where fallback.ts is still the empty placeholder array. It should be
    // revisited once curated fallback data is populated — at that point this
    // test's premise (`FALLBACK_PARTNERS.length === 0`) will simply skip.
    if (FALLBACK_PARTNERS.length === 0) {
      const mockFetch = (async () => {
        throw new Error('network error');
      }) as typeof fetch;

      const result = await fetchPartners({ fetch: mockFetch });
      expect(result).toEqual([]);
    }
  });
});
