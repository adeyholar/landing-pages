import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  images: {
    // Les photos d'origine sont petites : on les recompresse peu.
    qualities: [75, 90],
  },
  experimental: {
    serverActions: {
      // Le formulaire partenaire accepte une photo (compressée dans le
      // navigateur, 5 Mo au maximum avant compression).
      bodySizeLimit: "6mb",
    },
  },
  async headers() {
    return [
      {
        // Liens universels iOS : Apple exige un JSON servi sans extension.
        source: "/.well-known/apple-app-site-association",
        headers: [{ key: "Content-Type", value: "application/json" }],
      },
    ]
  },
}

export default nextConfig
