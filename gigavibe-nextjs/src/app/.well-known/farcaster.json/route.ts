function withValidProperties(
  properties: Record<string, undefined | string | string[]>,
) {
  return Object.fromEntries(
    Object.entries(properties).filter(([key, value]) => {
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      return !!value;
    }),
  );
}

export async function GET() {
  const URL = process.env.NEXT_PUBLIC_URL;

  return Response.json({
    accountAssociation: {
      header: process.env.FARCASTER_HEADER,
      payload: process.env.FARCASTER_PAYLOAD,
      signature: process.env.FARCASTER_SIGNATURE,
    },
    frame: withValidProperties({
      version: "1",
      name: process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME || "GIGAVIBE",
      subtitle: process.env.NEXT_PUBLIC_APP_SUBTITLE || "AI-Powered Vocal Training",
      description: process.env.NEXT_PUBLIC_APP_DESCRIPTION || "Train your voice with AI coaching and decentralized storage",
      screenshotUrls: [],
      iconUrl: process.env.NEXT_PUBLIC_APP_ICON,
      splashImageUrl: process.env.NEXT_PUBLIC_APP_SPLASH_IMAGE,
      splashBackgroundColor: process.env.NEXT_PUBLIC_SPLASH_BACKGROUND_COLOR || "#6366f1",
      homeUrl: URL,
      webhookUrl: `${URL}/api/webhook`,
      primaryCategory: process.env.NEXT_PUBLIC_APP_PRIMARY_CATEGORY || "music",
      tags: ["vocal", "training", "ai", "web3", "music"],
      heroImageUrl: process.env.NEXT_PUBLIC_APP_HERO_IMAGE,
      tagline: process.env.NEXT_PUBLIC_APP_TAGLINE || "Level up your voice with Web3",
      ogTitle: process.env.NEXT_PUBLIC_APP_OG_TITLE || "GIGAVIBE - AI Vocal Training",
      ogDescription: process.env.NEXT_PUBLIC_APP_OG_DESCRIPTION || "AI-Powered Vocal Training App with Web3 Social Features",
      ogImageUrl: process.env.NEXT_PUBLIC_APP_OG_IMAGE,
    }),
  });
}
