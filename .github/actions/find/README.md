# find

Finds potential accessibility gaps.

## Usage

### Inputs

#### `urls`

**Required** Newline-delimited list of URLs to check for accessibility issues. For example:

```txt
https://primer.style
https://primer.style/octicons/
```

#### `auth_context`

**Optional** Stringified JSON object containing `username`, `password`, `cookies`, and/or `localStorage` from an authenticated session. For example: `{"username":"some-user","password":"correct-horse-battery-staple","cookies":[{"name":"theme-preference","value":"light","domain":"primer.style","path":"/"}],"localStorage":{"https://primer.style":{"theme-preference":"light"}}}`

### Outputs

#### `findings`

List of potential accessibility gaps, as stringified JSON. For example:

```JS
'[]'
```

## Testing

### Horizontal Scroll Test

The `horizontal-scroll.test.ts` file contains tests that scan pages at a 320px x 256px viewport to ensure no horizontal scrolling is required. This tests that documents are responsive and accessible on small viewports.

To run the tests locally:

1. Start the test site server (e.g., `bundle exec puma -b tcp://127.0.0.1:4000` in the site directory)
2. Run `npm test` in the find action directory

The tests check the following pages:
- Home page
- About page
- 404 page
- Blog post page

Each test verifies that `document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1` (the +1 accounts for rounding).
