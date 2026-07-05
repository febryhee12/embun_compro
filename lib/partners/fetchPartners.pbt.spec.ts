import fc from 'fast-check';

import { fetchPartners } from './fetchPartners';

/**
 * Property-based test for fetchPartners.
 *
 * Feature: embun-company-profile-website, Property 10: fetchPartners totality
 *
 * For every fetch outcome — any HTTP status code, a malformed/non-array
 * JSON body, a body whose `.json()` rejects, or a thrown/rejected network
 * error — `fetchPartners` always resolves to a `PartnerDirectoryItem[]`
 * and never throws or rejects.
 *
 * Validates: Requirements 6.2, 6.3
 */

const NUM_RUNS = 100;

/** Arbitrary HTTP status code spanning 2xx/3xx/4xx/5xx (and a few out-of-range values). */
const statusArb = fc.integer({ min: 100, max: 599 });

/** A raw JSON body: an array of arbitrary values (well-formed), or a non-array (malformed). */
const jsonBodyArb = fc.oneof(
  fc.array(fc.anything(), { maxLength: 5 }),
  fc.oneof(
    fc.string(),
    fc.integer(),
    fc.boolean(),
    fc.constant(null),
    fc.dictionary(fc.string(), fc.anything()),
  ),
);

/** How `.json()` should behave for a given mock Response. */
const jsonBehaviorArb = fc.oneof(
  jsonBodyArb.map((body) => ({ kind: 'resolve' as const, body })),
  fc.constant({ kind: 'reject' as const }),
);

type ResponseScenario = {
  kind: 'response';
  status: number;
  jsonBehavior: { kind: 'resolve'; body: unknown } | { kind: 'reject' };
};

type NetworkErrorScenario = {
  kind: 'network-error';
  throwsSynchronously: boolean;
  errorMessage: string;
};

type Scenario = ResponseScenario | NetworkErrorScenario;

/** A scenario where `fetch` resolves to a mock Response with the given status/json behavior. */
const responseScenarioArb: fc.Arbitrary<ResponseScenario> = fc
  .record({ status: statusArb, jsonBehavior: jsonBehaviorArb })
  .map((cfg) => ({
    kind: 'response' as const,
    ...cfg,
  }));

/** A scenario where `fetch` itself throws synchronously or returns a rejected promise. */
const networkErrorScenarioArb: fc.Arbitrary<NetworkErrorScenario> = fc.record({
  kind: fc.constant('network-error' as const),
  throwsSynchronously: fc.boolean(),
  errorMessage: fc.string(),
});

const scenarioArb: fc.Arbitrary<Scenario> = fc.oneof(responseScenarioArb, networkErrorScenarioArb);

function buildMockFetch(scenario: Scenario): typeof fetch {
  if (scenario.kind === 'network-error') {
    const err = new Error(scenario.errorMessage);
    if (scenario.throwsSynchronously) {
      return (() => {
        throw err;
      }) as unknown as typeof fetch;
    }
    return (() => Promise.reject(err)) as unknown as typeof fetch;
  }

  const mockResponse = {
    status: scenario.status,
    json: () =>
      scenario.jsonBehavior.kind === 'resolve'
        ? Promise.resolve(scenario.jsonBehavior.body)
        : Promise.reject(new Error('invalid json')),
  };

  return (() => Promise.resolve(mockResponse)) as unknown as typeof fetch;
}

describe('fetchPartners totality — Property 10', () => {
  it('always resolves to an array and never throws, for any fetch outcome', async () => {
    await fc.assert(
      fc.asyncProperty(scenarioArb, async (scenario) => {
        const mockFetch = buildMockFetch(scenario);

        const result = await fetchPartners({ fetch: mockFetch, endpoint: 'https://example.test/campsites' });

        expect(Array.isArray(result)).toBe(true);
      }),
      { numRuns: NUM_RUNS },
    );
  });
});
