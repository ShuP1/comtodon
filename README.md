# Comtodon

A minimal commenting system for static blogs using external [Mastodon](https://joinmastodon.org) or API [compatible](https://pleroma.social) server.

- **painless:** use already existing fediverse accounts
- **serverless:** hosted on static server or cdn
- **lightweight:** any useless features *(IMO)*
- **no dependencies:** pure native js
- **personal:** no style, no tracking

```html
<div class="comtodon" data-domain="mastodon.social" data-status="100745593232538751"></div>
<script src="comtodon.min.js" defer></script>
```

See [index.html](index.html)

## Deep

Create a tree by adding `data-deep=N`
  - 0: Full tree
  - 1: Only "direct" replies
  - 2: With replies to replies
  - And so on

## Moderation ?

Add `data-moderator="{moderator_id}"` to display only approved *(replied)* comments

Note: Can't use fav, it requires authentication

## Hugo
Put `comtodon.min.js` in `static` folder

In your site config
```yaml
params:
  comtodon:
    domain: mastodon.social
    # moderator: 358957
```

In your single page layout
```html
{{ if .Params.comtodon }}
<div class="comtodon" data-domain="{{ .Site.Params.comtodon.domain }}" data-status="{{ .Params.comtodon }}" {{ with .Site.Params.comtodon.moderator }}data-moderator="{{ . }}"{{ end }}></div>
<script src="/comtodon.min.js" defer></script>
{{- end }}
```

In your content header
```yaml
comtodon: 100745593232538751
```

**Style it**

## Mastodon

Only use `/api/v1/statuses/:id/context`. See [doc](https://docs.joinmastodon.org/api/rest/statuses/#get-api-v1-statuses-id-context)

> No authentication required

```
{
  descendants: [{
    account: {
      acct,
      avatar_static,
      display_name,
      id,
      emojis: [{shortcode, static_url}],
      url
    },
    created_at,
    content,
    emojis: [{shortcode, static_url}],
    id,
    in_reply_to_id,
    sensitive,
    spoiler_text
  }]
}
```

## No js ?

Simple placeholder
```html
<div class="comtodon" data-domain="mastodon.social" data-status="100745593232538751">
    <p class="no-js sad">Enable JavaScript to see comments</p>
</div>
```

## TODO

- Use personal status as sample
- Create proxy backend for cache and moderating with fav
- Auto-magically create statuses from hugo ???