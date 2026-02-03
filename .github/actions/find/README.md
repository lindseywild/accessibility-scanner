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

## Scanning

The find action performs two types of accessibility scans on each URL:

### 1. Axe Core Accessibility Scan

Uses [@axe-core/playwright](https://github.com/dequelabs/axe-core-npm/tree/develop/packages/playwright) to detect common accessibility violations like:
- Color contrast issues
- Missing heading structure
- Empty headings
- And more WCAG violations

### 2. Horizontal Scroll Check (320x256 viewport)

Automatically checks if pages require horizontal scrolling at a 320px x 256px viewport. This tests responsive design and ensures content is accessible on small mobile viewports, aligning with WCAG 2.1 Level AA Success Criterion 1.4.10 (Reflow).

If a page requires horizontal scrolling at this viewport size, a finding is generated with:
- **scannerType**: `viewport`
- **ruleId**: `horizontal-scroll-320x256`
- **problemShort**: page requires horizontal scrolling at 320x256 viewport
- **problemUrl**: https://www.w3.org/WAI/WCAG21/Understanding/reflow.html
