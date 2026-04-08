/**
 * EMPYRA MINING INNOVATIONS — servicesData.js
 * ─────────────────────────────────────────────
 * Maps every service route key (used in data-route="" and ?service= query param)
 * to its full EN + FR content for the page hero section.
 *
 * Fields per entry:
 *   icon      → FontAwesome class (fa-xxx) shown in the hero watermark
 *   eyebrow   → Small label above the title (e.g. "What We Do")
 *   title     → Main <h1> — wrap a word in <em></em> for the gold highlight
 *   breadcrumb→ The last item in the breadcrumb trail
 *   category  → Category name shown as sub-label (optional)
 */

const SERVICES_DATA = {

  /* ── ENVIRONMENT & SUSTAINABLE MANAGEMENT ─────────────────────────── */

  geochemistry: {
    en: {
      icon:       "fa-flask",
      eyebrow:    "Environment & Sustainable Management",
      title:      "Environmental Geochemistry <em>&amp; ARD</em>",
      breadcrumb: "Environmental Geochemistry & ARD",
      category:   "Environment & Sustainable Management"
    },
    fr: {
      icon:       "fa-flask",
      eyebrow:    "Environnement & Gestion Durable",
      title:      "Géochimie Environnementale <em>&amp; ARD</em>",
      breadcrumb: "Géochimie Environnementale & ARD",
      category:   "Environnement & Gestion Durable"
    }
  },

  water: {
    en: {
      icon:       "fa-water",
      eyebrow:    "Environment & Sustainable Management",
      title:      "Mine Water <em>Management</em>",
      breadcrumb: "Mine Water Management",
      category:   "Environment & Sustainable Management"
    },
    fr: {
      icon:       "fa-water",
      eyebrow:    "Environnement & Gestion Durable",
      title:      "Gestion des <em>Eaux de Mine</em>",
      breadcrumb: "Gestion des Eaux de Mine",
      category:   "Environnement & Gestion Durable"
    }
  },

  environment: {
    en: {
      icon:       "fa-leaf",
      eyebrow:    "Environment & Sustainable Management",
      title:      "Environment &amp; <em>Social Responsibility</em>",
      breadcrumb: "Environment & Social Responsibility",
      category:   "Environment & Sustainable Management"
    },
    fr: {
      icon:       "fa-leaf",
      eyebrow:    "Environnement & Gestion Durable",
      title:      "Environnement &amp; <em>Responsabilité Sociale</em>",
      breadcrumb: "Environnement & Responsabilité Sociale",
      category:   "Environnement & Gestion Durable"
    }
  },

  /* ── AUDITS, EXPERTISE & RISK MANAGEMENT ──────────────────────────── */

  audit: {
    en: {
      icon:       "fa-search",
      eyebrow:    "Audits, Expertise & Risk Management",
      title:      "Independent Expertise <em>&amp; Audits</em>",
      breadcrumb: "Independent Expertise & Audits",
      category:   "Audits, Expertise & Risk Management"
    },
    fr: {
      icon:       "fa-search",
      eyebrow:    "Audits, Expertise & Gestion des Risques",
      title:      "Expertise Indépendante <em>&amp; Audits</em>",
      breadcrumb: "Expertise Indépendante & Audits",
      category:   "Audits, Expertise & Gestion des Risques"
    }
  },

  risk: {
    en: {
      icon:       "fa-exclamation-triangle",
      eyebrow:    "Audits, Expertise & Risk Management",
      title:      "Risk <em>Management</em>",
      breadcrumb: "Risk Management",
      category:   "Audits, Expertise & Risk Management"
    },
    fr: {
      icon:       "fa-exclamation-triangle",
      eyebrow:    "Audits, Expertise & Gestion des Risques",
      title:      "Gestion des <em>Risques</em>",
      breadcrumb: "Gestion des Risques",
      category:   "Audits, Expertise & Gestion des Risques"
    }
  },

  /* ── EXPLORATION & RESOURCE ASSESSMENT ────────────────────────────── */

  modeling: {
    en: {
      icon:       "fa-cubes",
      eyebrow:    "Exploration & Resource Assessment",
      title:      "Mineral Resource <em>Modeling</em>",
      breadcrumb: "Mineral Resource Modeling",
      category:   "Exploration & Resource Assessment"
    },
    fr: {
      icon:       "fa-cubes",
      eyebrow:    "Exploration & Évaluation des Ressources",
      title:      "Modélisation des <em>Ressources Minérales</em>",
      breadcrumb: "Modélisation des Ressources Minérales",
      category:   "Exploration & Évaluation des Ressources"
    }
  },

  exploration: {
    en: {
      icon:       "fa-compass",
      eyebrow:    "Exploration & Resource Assessment",
      title:      "Exploration <em>Services</em>",
      breadcrumb: "Exploration Services",
      category:   "Exploration & Resource Assessment"
    },
    fr: {
      icon:       "fa-compass",
      eyebrow:    "Exploration & Évaluation des Ressources",
      title:      "Services <em>d'Exploration</em>",
      breadcrumb: "Services d'Exploration",
      category:   "Exploration & Évaluation des Ressources"
    }
  },

  feasibility: {
    en: {
      icon:       "fa-chart-bar",
      eyebrow:    "Exploration & Resource Assessment",
      title:      "Feasibility <em>Studies</em>",
      breadcrumb: "Feasibility Studies",
      category:   "Exploration & Resource Assessment"
    },
    fr: {
      icon:       "fa-chart-bar",
      eyebrow:    "Exploration & Évaluation des Ressources",
      title:      "Études de <em>Faisabilité</em>",
      breadcrumb: "Études de Faisabilité",
      category:   "Exploration & Évaluation des Ressources"
    }
  },

  /* ── ENGINEERING & MINING OPERATIONS ──────────────────────────────── */

  operations: {
    en: {
      icon:       "fa-cogs",
      eyebrow:    "Engineering & Mining Operations",
      title:      "Mining Operations <em>Support</em>",
      breadcrumb: "Mining Operations Support",
      category:   "Engineering & Mining Operations"
    },
    fr: {
      icon:       "fa-cogs",
      eyebrow:    "Ingénierie & Exploitation Minière",
      title:      "Support aux <em>Opérations Minières</em>",
      breadcrumb: "Support aux Opérations Minières",
      category:   "Ingénierie & Exploitation Minière"
    }
  },

  openpit: {
    en: {
      icon:       "fa-mountain",
      eyebrow:    "Engineering & Mining Operations",
      title:      "Open-Pit <em>Mining</em>",
      breadcrumb: "Open-Pit Mining",
      category:   "Engineering & Mining Operations"
    },
    fr: {
      icon:       "fa-mountain",
      eyebrow:    "Ingénierie & Exploitation Minière",
      title:      "Mines à <em>Ciel Ouvert</em>",
      breadcrumb: "Mines à Ciel Ouvert",
      category:   "Ingénierie & Exploitation Minière"
    }
  },

  underground: {
    en: {
      icon:       "fa-hard-hat",
      eyebrow:    "Engineering & Mining Operations",
      title:      "Underground <em>Mining</em>",
      breadcrumb: "Underground Mining",
      category:   "Engineering & Mining Operations"
    },
    fr: {
      icon:       "fa-hard-hat",
      eyebrow:    "Ingénierie & Exploitation Minière",
      title:      "Mines <em>Souterraines</em>",
      breadcrumb: "Mines Souterraines",
      category:   "Ingénierie & Exploitation Minière"
    }
  },

  closure: {
    en: {
      icon:       "fa-times-circle",
      eyebrow:    "Engineering & Mining Operations",
      title:      "Mine <em>Closure</em>",
      breadcrumb: "Mine Closure",
      category:   "Engineering & Mining Operations"
    },
    fr: {
      icon:       "fa-times-circle",
      eyebrow:    "Ingénierie & Exploitation Minière",
      title:      "Fermeture <em>de Mines</em>",
      breadcrumb: "Fermeture de Mines",
      category:   "Ingénierie & Exploitation Minière"
    }
  }

};