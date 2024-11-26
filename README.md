
# Personal website

A Next.js app for my blog and personal website. Uses Incremental Static Regeneration to reduce page load times. 
Styled with [shadcn](https://ui.shadcn.com/) and Tailwind CSS, deployed to a k8s cluster running on two VPSs.


## Local development

Clone the project

```bash
  git clone https://github.com/laurimaila/personal-website && cd personal-website
```

Install node dependencies

```bash
  pnpm install
```

Start the development server

```bash
  pnpm dev
```


## Deployment

The standalone Node server can be built using `pnpm next build`. After passing tests in CI, the image is automatically pushed to ghcr.io and updated to the production cluster.
    