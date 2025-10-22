// Safe place for link tags that Metadata API doesn't cover (like oEmbed).
export default function Head() {
  return (
    <>
      <link
        rel="alternate"
        type="application/json+oembed"
        href="/oEmbed.json"
      />
    </>
  );
}
