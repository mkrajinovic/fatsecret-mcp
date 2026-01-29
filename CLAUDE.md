# Claude Code Instructions

## Testing

**Always use the `vitest-expert` agent** for writing, extending, and working with tests.

```bash
# Run tests
npm test              # watch mode
npm run test:run      # single run
npm run test:coverage # with coverage report
```

### Test Structure

```
src/__tests__/
├── oauth/           # OAuth signature and requests
├── utils/           # Utilities (encoding, date)
├── methods/         # API methods
└── client.test.ts   # Client
```

### Mocking Strategy

- `node-fetch` — for HTTP request tests
- `makeApiRequest`/`makeOAuthRequest` — for method tests
- All methods from `methods/index.js` — for client tests

## Schema Validation

**Always use the `zod-expert` agent** for creating, updating, or debugging Zod validation schemas.

The agent is especially useful for:
- Creating new validation schemas
- Migrating from Zod v3 to v4
- Debugging validation errors
- Optimizing schema performance

## FatSecret API

### Documentation

- [Official Docs](https://platform.fatsecret.com/docs/guides)
- [Authentication Guide](https://platform.fatsecret.com/docs/guides/authentication)
- [Error Codes](https://platform.fatsecret.com/docs/guides/error-codes)
- [Data Types](https://platform.fatsecret.com/docs/guides/data-types)
- [Postman Collection](https://github.com/fatsecret-group/postman-fatsecret-apis)

### API Endpoints

- **Method-based**: `https://platform.fatsecret.com/rest/server.api` (used in this project)
- **URL-based**: `https://platform.fatsecret.com/rest/`

### Authentication

- **OAuth 1.0** — Consumer Key + Shared Secret, supports delegated requests for user profile operations
- **OAuth 2.0** — Signed Requests only (no profile access)

Delegated requests (3-legged OAuth) required for: food diary, weight diary, saved meals, favorites.

### Data Types

| Type | Description |
|------|-------------|
| `Boolean` | `"true"` or `"false"` (strings) |
| `Decimal` | Numbers with fractional parts |
| `Int` | 32-bit integer |
| `Long` | 64-bit integer (for IDs) |
| `Ternary` | `1` (true), `0` (false), `-1` (unknown) |

### Enum Parameters

| Parameter | Values |
|-----------|--------|
| `meal` | `breakfast`, `lunch`, `dinner`, `other` |
| `food_type` | `Brand`, `Generic` |
| `brand_type` | `manufacturer`, `restaurant`, `supermarket` |
| `weight_type` | `kg`, `lb` |
| `height_type` | `cm`, `inch` |

### Error Codes

| Code | Description |
|------|-------------|
| 2-9 | OAuth 1.0 errors (credentials, signature, token) |
| 10 | Unknown method |
| 11 | Rate limit reached |
| 13-14 | OAuth 2.0 errors |
| 101-109 | Invalid parameters |
| 201-211 | Domain-specific errors |

### Response Quirks

- Numeric values often returned as strings
- Single-item arrays may return as object (normalization needed)
- Empty data may return as `null`, `{}`, or be absent
