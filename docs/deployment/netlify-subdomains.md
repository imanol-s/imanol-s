# Netlify subdomain planning notes

Historical planning reference, not a live infrastructure inventory. DNS delegation, domain ownership, certificate status, account limits and pricing have not been reverified by this cleanup. Check the current Netlify dashboard, DNS responses and official documentation before deploying or changing records.

## Deployment approach

For an independently built project, a separate Netlify site can be assigned a project subdomain. Separate repositories were the proposed approach, not a platform requirement; select repository/build organization for the actual project.

1. Confirm access to the domain and the intended project's repository/site.
2. Configure the site's build and output settings from its own source.
3. Assign the intended subdomain in domain management.
4. Follow Netlify's current DNS instructions for the authoritative DNS provider.
5. Verify DNS resolution, HTTPS and the served site before reporting delivery.

## Historical domain snapshot

Earlier notes reported `imanols.dev` and `www.imanols.dev` delegated to Netlify, with `NETLIFY`/`NETLIFYv6` records targeting `imanols-dev.netlify.app`. This is historical, unverified state, not authorization to change DNS or evidence that delegation is still active. Earlier free-tier credit/build/bandwidth estimates are intentionally omitted because they were not verified against current account terms.

Official references: [Netlify DNS setup](https://docs.netlify.com/manage/domains/set-up-netlify-dns/) and [standalone subdomain delegation](https://docs.netlify.com/manage/domains/configure-domains/delegate-a-standalone-subdomain/).
