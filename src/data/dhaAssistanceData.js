export const PROBLEM_CATEGORIES = [
  {
    id: "buying",
    title: "Do you want to buy a property?",
    description: "Looking for plots, houses, or commercial units in DHA",
    icon: "Home",
    questions: [
      {
        id: "phase",
        question: "Which DHA phase are you interested in?",
        options: ["Phase 5", "Phase 6", "Phase 7", "Phase 8", "Phase 9 Prism", "Any / Not sure"]
      },
      {
        id: "propertyType",
        question: "What type of property are you looking for?",
        options: ["Residential Plot", "Constructed House", "Commercial Plot", "Apartment"]
      },
      {
        id: "budget",
        question: "What's your approximate budget?",
        options: ["Under 1 Crore", "1 - 2 Crore", "2 - 5 Crore", "5 Crore+"]
      },
      {
        id: "intent",
        question: "Are you looking for investment or personal use?",
        options: ["Investment", "Personal Living / End Use", "Both"]
      }
    ],
    generateMessage: (ans) => {
      let msg = `Hi, I'm looking to buy a property in DHA Lahore.`;
      if (ans.phase) msg += ` I'm interested in ${ans.phase}.`;
      if (ans.propertyType) msg += ` I'm looking for a ${ans.propertyType.toLowerCase()}.`;
      if (ans.budget) msg += ` My budget is around ${ans.budget}.`;
      if (ans.intent) msg += ` I'm buying primarily for ${ans.intent.toLowerCase()}.`;
      msg += ` Please share what options are currently available.`;
      return msg;
    }
  },
  {
    id: "selling",
    title: "Do you want to sell your property?",
    description: "List and sell your DHA property quickly with experts",
    icon: "Tag",
    questions: [
      {
        id: "phase",
        question: "Which DHA phase is your property in?",
        options: ["Phase 1-4", "Phase 5", "Phase 6", "Phase 7", "Phase 8", "Phase 9 Prism", "Other Phase"]
      },
      {
        id: "propertyType",
        question: "What type of property is it?",
        options: ["Residential Plot", "Constructed House", "Commercial Plot", "Apartment / File"]
      },
      {
        id: "expectedPrice",
        question: "What price are you expecting?",
        options: ["Under 2 Crore", "2 - 5 Crore", "5 - 10 Crore", "10 Crore+"]
      },
      {
        id: "timeline",
        question: "How soon are you looking to sell?",
        options: ["As soon as possible", "Within 1-2 months", "Just exploring market value"]
      }
    ],
    generateMessage: (ans) => {
      let msg = `Hi, I want to sell my property in DHA Lahore.`;
      if (ans.phase) msg += ` It's located in ${ans.phase}.`;
      if (ans.propertyType) msg += ` The property type is a ${ans.propertyType.toLowerCase()}.`;
      if (ans.expectedPrice) msg += ` I am expecting around ${ans.expectedPrice}.`;
      if (ans.timeline) msg += ` My selling timeline is: ${ans.timeline.toLowerCase()}.`;
      msg += ` Please let me know how you can assist.`;
      return msg;
    }
  },
  {
    id: "finding_buyer",
    title: "Do you have a property but can't find the right buyer?",
    description: "Get active buyer matching and professional marketing",
    icon: "Users",
    questions: [
      {
        id: "phase",
        question: "Which phase is the property in?",
        options: ["Phase 5", "Phase 6", "Phase 7", "Phase 8", "Phase 9 Prism", "Other"]
      },
      {
        id: "propertyType",
        question: "What property type?",
        options: ["Plot", "House", "Commercial", "File"]
      },
      {
        id: "askingPrice",
        question: "What is your asking price?",
        options: ["Under 3 Crore", "3 - 6 Crore", "6 Crore+"]
      },
      {
        id: "duration",
        question: "How long has it been on the market?",
        options: ["Just listed", "A few weeks", "A few months or more"]
      }
    ],
    generateMessage: (ans) => {
      let msg = `Hi, I have a property in DHA (${ans.phase || "Lahore"}) that I'm trying to sell (${ans.propertyType || "Property"}).`;
      if (ans.askingPrice) msg += ` Asking price is around ${ans.askingPrice}.`;
      msg += ` It has been on the market for ${ans.duration ? ans.duration.toLowerCase() : "some time"}. I need help finding the right buyer.`;
      return msg;
    }
  },
  {
    id: "investment",
    title: "Do you want to invest in DHA but don't know what to buy?",
    description: "Expert guidance on high-yield and secure investment sectors",
    icon: "TrendingUp",
    questions: [
      {
        id: "budget",
        question: "What's your approximate investment budget?",
      options: ["1 - 2 Crore", "2 - 5 Crore", "5 Crore+"]
      },
      {
        id: "timeline",
        question: "What is your investment holding timeline?",
        options: ["Short term (1 year)", "Medium term (2-3 years)", "Long term (3+ years)"]
      },
      {
        id: "priority",
        question: "What is your main priority?",
        options: ["Maximum capital growth", "Steady rental income", "Safe & liquid asset"]
      }
    ],
    generateMessage: (ans) => {
      let msg = `Hi, I want to invest in DHA Lahore and need expert advice.`;
      if (ans.budget) msg += ` My budget is around ${ans.budget}.`;
      if (ans.timeline) msg += ` My holding timeline is ${ans.timeline.toLowerCase()}.`;
      if (ans.priority) msg += ` My main priority is ${ans.priority.toLowerCase()}.`;
      msg += ` Please suggest the best options for my situation.`;
      return msg;
    }
  },
  {
    id: "rental",
    title: "Do you need to rent a property?",
    description: "Find rental houses, apartments, or commercial offices",
    icon: "Key",
    questions: [
      {
        id: "phase",
        question: "Which DHA phase do you prefer?",
        options: ["Phase 5", "Phase 6", "Phase 8", "Phase 1-4", "Any mature phase"]
      },
      {
        id: "propertyType",
        question: "What type of rental are you looking for?",
        options: ["Residential House", "Luxury Apartment", "Commercial Office / Shop"]
      },
      {
        id: "budget",
        question: "What is your monthly rent budget?",
        options: ["Under 1.5 Lakh", "1.5 - 3 Lakh", "3 Lakh+"]
      },
      {
        id: "timeline",
        question: "When do you need it?",
        options: ["Immediately / This month", "Within 2-3 months"]
      }
    ],
    generateMessage: (ans) => {
      let msg = `Hi, I'm looking to rent a ${ans.propertyType ? ans.propertyType.toLowerCase() : "property"} in DHA (${ans.phase || "Lahore"}).`;
      if (ans.budget) msg += ` My monthly budget is around ${ans.budget}.`;
      if (ans.timeline) msg += ` I need it ${ans.timeline.toLowerCase()}. Please share available options.`;
      return msg;
    }
  },
  {
    id: "rent_out",
    title: "Do you want to rent out your property?",
    description: "Find verified, reliable tenants for your property",
    icon: "Building",
    questions: [
      {
        id: "phase",
        question: "Which phase is your property in?",
        options: ["Phase 5", "Phase 6", "Phase 7", "Phase 8", "Other"]
      },
      {
        id: "propertyType",
        question: "What property type?",
        options: ["House", "Portion", "Apartment", "Commercial"]
      },
      {
        id: "expectedRent",
        question: "What is your expected monthly rent?",
        options: ["Under 1.5 Lakh", "1.5 - 3 Lakh", "3 Lakh+"]
      },
      {
        id: "vacant",
        question: "Is the property currently vacant?",
        options: ["Yes, vacant now", "Will be vacant soon"]
      }
    ],
    generateMessage: (ans) => {
      let msg = `Hi, I want to rent out my ${ans.propertyType ? ans.propertyType.toLowerCase() : "property"} in DHA (${ans.phase || "Lahore"}).`;
      if (ans.expectedRent) msg += ` Expected rent is around ${ans.expectedRent}.`;
      msg += ` Property status: ${ans.vacant ? ans.vacant.toLowerCase() : "vacant"}. Please help me find a reliable tenant.`;
      return msg;
    }
  },
  {
    id: "overseas",
    title: "Are you overseas and need someone to handle your DHA property?",
    description: "Trusted remote management, buying, and selling for overseas Pakistanis",
    icon: "Globe",
    questions: [
      {
        id: "serviceType",
        question: "What do you need help with?",
        options: ["Buying remotely", "Selling remotely", "General property management & supervision"]
      },
      {
        id: "phase",
        question: "Which DHA phase?",
        options: ["Phase 5", "Phase 6", "Phase 7", "Phase 8", "Phase 9 Prism", "Other"]
      },
      {
        id: "propertyType",
        question: "What type of property?",
        options: ["Plot", "House", "File", "Commercial"]
      }
    ],
    generateMessage: (ans) => {
      let msg = `Hi, I'm an overseas Pakistani and need help with ${ans.serviceType ? ans.serviceType.toLowerCase() : "my property"} in DHA (${ans.phase || "Lahore"}).`;
      if (ans.propertyType) msg += ` Property type: ${ans.propertyType.toLowerCase()}.`;
      msg += ` Please guide me on how your team can handle this securely on my behalf.`;
      return msg;
    }
  },
  {
    id: "verification",
    title: "Do you need help checking a property or deal?",
    description: "Professional guidance on market pricing and documentation safety",
    icon: "ShieldCheck",
    questions: [
      {
        id: "dealType",
        question: "Are you buying or selling?",
        options: ["Buying a property", "Selling a property"]
      },
      {
        id: "phase",
        question: "Which DHA phase?",
        options: ["Phase 5", "Phase 6", "Phase 7", "Phase 8", "Other"]
      },
      {
        id: "specificNeed",
        question: "What specifically do you need checked?",
        options: ["Market pricing fairness", "Documentation & transfer verification guidance", "General deal review"]
      }
    ],
    generateMessage: (ans) => {
      let msg = `Hi, I need professional assistance checking a property deal in DHA (${ans.phase || "Lahore"}).`;
      if (ans.dealType) msg += ` I am ${ans.dealType.toLowerCase()}.`;
      if (ans.specificNeed) msg += ` I need help with: ${ans.specificNeed.toLowerCase()}.`;
      msg += ` Please review this with me.`;
      return msg;
    }
  },
  {
    id: "construction",
    title: "Do you want to build or develop your DHA property?",
    description: "Architectural design, gray structure, and turnkey construction",
    icon: "Wrench",
    questions: [
      {
        id: "phase",
        question: "Which phase is your plot in?",
        options: ["Phase 5", "Phase 6", "Phase 7", "Phase 8", "Other"]
      },
      {
        id: "plotSize",
        question: "What is your plot size?",
        options: ["5 Marla", "10 Marla", "1 Kanal", "Commercial"]
      },
      {
        id: "stage",
        question: "What stage are you currently at?",
        options: ["Just planning / Need design", "Ready to start construction", "Looking for contractor"]
      }
    ],
    generateMessage: (ans) => {
      let msg = `Hi, I want to build a house on my ${ans.plotSize || "1 Kanal"} plot in DHA (${ans.phase || "Lahore"}).`;
      if (ans.stage) msg += ` Current status: ${ans.stage.toLowerCase()}.`;
      msg += ` I'd like to discuss construction services and estimates with your team.`;
      return msg;
    }
  },
  {
    id: "property_management",
    title: "Do you need someone to manage your DHA property?",
    description: "Utility bill tracking, maintenance supervision, and caretaking",
    icon: "ClipboardList",
    questions: [
      {
        id: "phase",
        question: "Which phase is your property in?",
        options: ["Phase 5", "Phase 6", "Phase 7", "Phase 8", "Other"]
      },
      {
        id: "propertyType",
        question: "What type of property?",
        options: ["Residential Plot", "Constructed House", "Commercial Property"]
      },
      {
        id: "managementType",
        question: "What kind of management do you need?",
        options: ["Caretaking & bill payments", "Tenant & rent collection management", "General upkeep supervision"]
      }
    ],
    generateMessage: (ans) => {
      let msg = `Hi, I need professional property management for my ${ans.propertyType ? ans.propertyType.toLowerCase() : "property"} in DHA (${ans.phase || "Lahore"}).`;
      if (ans.managementType) msg += ` Service needed: ${ans.managementType.toLowerCase()}.`;
      msg += ` Please let me know how you can assist.`;
      return msg;
    }
  },
  {
    id: "other",
    title: "Do you have another property-related problem?",
    description: "Tell us what you need help with and we'll assist",
    icon: "HelpCircle",
    isCustom: true,
    questions: [],
    generateMessage: (customText) => {
      return `Hi, I have a property-related query regarding DHA Lahore: "${customText || "I need assistance."}". Please help me out.`;
    }
  }
];
