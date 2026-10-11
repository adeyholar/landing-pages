export const site = {
  name: "Passeline",
  url: "https://passeline.example",
  description:
    "Passeline carries your gifts across Wrenhaven, Vermont, and up to 12 miles around, by cargo-bike courier or through a vetted neighbor down the street. The town’s own shops sell their goods, treatments and gift cards in the app too.",
  email: "contact@passeline.example",
  // App fictive : les liens mènent à la page neutre de l'App Store.
  appStoreUrl: "http://lndev.me/",
  driverAppUrl: "http://lndev.me/",
  proUrl: "http://lndev.me/",
  company: {
    legalName: "Passeline, Inc.",
    form: "a Delaware corporation",
    street: "7 Old Bridge Street",
    city: "Wrenhaven",
    state: "VT",
    zip: "00000",
    president: "Hugo Lescure",
  },
  // Hébergeur fictif (inventé pour la maquette), cité dans la page « Legal ».
  hosting: {
    name: "Riverbank Hosting Co.",
    address: "40 Mill Yard Road, Wrenhaven, VT 00000",
  },
  zone: "Wrenhaven and 12 miles around",
} as const

export const legalNav = [
  { label: "Terms of Service", href: "/terms" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Legal notice", href: "/legal" },
  { label: "Delete your account", href: "/delete-account" },
  { label: "Courier Agreement", href: "/courier-agreement" },
  { label: "Merchant Agreement", href: "/merchant-agreement" },
] as const
