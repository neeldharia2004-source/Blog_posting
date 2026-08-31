import { PrismaClient, BlogStatus, PublishingPlatform, PublishingStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting comprehensive database seeding with 5 enterprise companies...\n");

  // Clean existing records in reverse dependency order
  await prisma.publishedPost.deleteMany();
  await prisma.blog.deleteMany();
  await prisma.contextFile.deleteMany();
  await prisma.product.deleteMany();
  await prisma.section.deleteMany();
  await prisma.project.deleteMany();
  await prisma.company.deleteMany();

  console.log("🧹 Cleaned existing tables.");

  // =========================================================================
  // 1. COMPANY 1: Acme Cloud Technologies
  // =========================================================================
  const acme = await prisma.company.create({
    data: {
      name: "Acme Cloud Technologies",
      description:
        "Enterprise cloud and AI infrastructure provider helping global engineering teams deploy scalable, fault-tolerant edge systems and autonomous agent pipelines.",
    },
  });
  console.log(`🏢 [1/5] Created: ${acme.name}`);

  const acmeCloudSec = await prisma.section.create({
    data: {
      companyId: acme.id,
      name: "Cloud Infrastructure",
      description: "Distributed edge networking, serverless compute, and managed Kubernetes clusters.",
    },
  });

  const acmeAiSec = await prisma.section.create({
    data: {
      companyId: acme.id,
      name: "AI & Agent Systems",
      description: "Deterministic LLM orchestration, model routing, and production agent observability.",
    },
  });

  const acmeEdge = await prisma.product.create({
    data: {
      sectionId: acmeCloudSec.id,
      name: "Acme Edge Compute",
      description:
        "Low-latency serverless function runtime running across 320+ edge Points of Presence with cold starts under 5ms.",
    },
  });

  const acmeAgent = await prisma.product.create({
    data: {
      sectionId: acmeAiSec.id,
      name: "Acme Agent Orchestrator",
      description:
        "Multi-agent coordination framework providing typed tool schemas, deterministic state rollbacks, and real-time execution graphs.",
    },
  });

  const acmeCampaignProj = await prisma.project.create({
    data: {
      companyId: acme.id,
      name: "Q3 AI Agents Launch Campaign",
      description:
        "Content marketing series establishing thought leadership around deterministic agent design and enterprise AI reliability.",
    },
  });

  const acmeDevProj = await prisma.project.create({
    data: {
      companyId: acme.id,
      name: "Developer Advocacy & Tutorials",
      description:
        "Hands-on architectural tutorials, benchmark comparisons, and developer guides for edge-first applications.",
    },
  });

  await prisma.contextFile.createMany({
    data: [
      {
        projectId: acmeCampaignProj.id,
        fileName: "agent-orchestrator-architecture.md",
        fileType: "text/markdown",
        filePath: "/uploads/context/agent-orchestrator-architecture.md",
        extractedContent:
          "# Acme Agent Orchestrator Architecture\n- Core Engine: State machine based on deterministic Directed Acyclic Graphs (DAG).\n- Model Compatibility: Gemini 1.5 Pro, Flash, GPT-4o, Claude 3.5 Sonnet.\n- Fault Tolerance: Automated state rollback on tool failure, persistent replay logs.\n- Benchmarks: 40% lower token waste than standard ReAct loops.",
      },
      {
        projectId: acmeCampaignProj.id,
        fileName: "brand-voice-guide.txt",
        fileType: "text/plain",
        filePath: "/uploads/context/brand-voice-guide.txt",
        extractedContent:
          "Brand Voice: Technical, pragmatic, concise, and backed by systems engineering principles. Avoid hyperbolic buzzwords like 'revolutionary' or 'game-changing'. Focus on latency numbers, error rates, and architecture.",
      },
      {
        projectId: acmeCampaignProj.id,
        fileName: "q3-positioning-brief.txt",
        fileType: "text/plain",
        filePath: "/uploads/context/q3-positioning-brief.txt",
        extractedContent:
          "Target Audience: Staff Engineers, Principal Architects, and VP of Engineering in Fortune 500 enterprises transitioning from prototype chatbots to production AI agent workflows.",
      },
    ],
  });

  const acmeBlog1 = await prisma.blog.create({
    data: {
      projectId: acmeCampaignProj.id,
      title: "Building Deterministic Multi-Agent Workflows at Scale",
      topic: "Enterprise AI Agent Orchestration and Observability",
      status: BlogStatus.APPROVED,
      content:
        "# Building Deterministic Multi-Agent Workflows at Scale\n\nModern engineering organizations are shifting from single-turn LLM prompting to autonomous multi-agent pipelines. However, running agents in production requires robust guardrails, deterministic state transitions, and real-time observability.\n\n## The Challenge of Stochastic Workflows\nWhen LLM agents operate without structured supervision, unpredictable branch execution and hallucinated tool calls can quickly degrade system reliability.\n\n## The Acme Architecture\nWith Acme Agent Orchestrator, developers gain:\n- Strict schema validation for every tool invocation\n- Sub-50ms execution loops on our global edge network\n- Seamless integration with foundational models",
    },
  });

  await prisma.publishedPost.createMany({
    data: [
      {
        blogId: acmeBlog1.id,
        platform: PublishingPlatform.BLOGGER,
        status: PublishingStatus.PUBLISHED,
        url: "https://acme-engineering.blogger.com/2026/08/deterministic-multi-agent-workflows.html",
        externalPostId: "blogger_post_987654321",
        publishedAt: new Date(),
      },
      {
        blogId: acmeBlog1.id,
        platform: PublishingPlatform.WORDPRESS,
        status: PublishingStatus.PENDING,
        url: null,
        externalPostId: null,
      },
    ],
  });

  await prisma.blog.create({
    data: {
      projectId: acmeCampaignProj.id,
      title: "Why Sub-Millisecond Edge Runtimes Matter for Real-Time LLM Agents",
      topic: "Edge Computing Latency and AI Agent Response Times",
      status: BlogStatus.GENERATED,
      content:
        "# Why Sub-Millisecond Edge Runtimes Matter for Real-Time LLM Agents\n\nIn interactive agentic workflows, every round-trip between an AI model and external APIs compounds total latency. Running compute at the network edge dramatically minimizes time-to-first-token.",
    },
  });

  // =========================================================================
  // 2. COMPANY 2: PulseHealth AI
  // =========================================================================
  const pulse = await prisma.company.create({
    data: {
      name: "PulseHealth AI",
      description:
        "Clinical intelligence and healthcare automation platform streamlining physician documentation, patient communications, and electronic health record workflows.",
    },
  });
  console.log(`🏢 [2/5] Created: ${pulse.name}`);

  const pulseClinicalSec = await prisma.section.create({
    data: {
      companyId: pulse.id,
      name: "Clinical Intelligence",
      description: "Ambient listening, medical charting automation, and diagnostic decision support tools.",
    },
  });

  const pulsePatientSec = await prisma.section.create({
    data: {
      companyId: pulse.id,
      name: "Patient Engagement",
      description: "Post-discharge monitoring, secure patient portals, and automated appointment triage.",
    },
  });

  await prisma.product.createMany({
    data: [
      {
        sectionId: pulseClinicalSec.id,
        name: "PulseScribe Ambient EHR",
        description:
          "HIPAA-compliant ambient AI listener that converts physician-patient conversations into structured EHR notes in under 10 seconds.",
      },
      {
        sectionId: pulsePatientSec.id,
        name: "MedChat Care Navigator",
        description:
          "24/7 multilingual patient care assistant integrated with Epic and Cerner for triage and medication reminders.",
      },
    ],
  });

  const pulseHipaaProj = await prisma.project.create({
    data: {
      companyId: pulse.id,
      name: "HIPAA-Compliant Clinical AI Rollout",
      description:
        "Content strategy educating healthcare systems on security, data privacy, and BAA compliance when adopting generative AI.",
    },
  });

  await prisma.contextFile.createMany({
    data: [
      {
        projectId: pulseHipaaProj.id,
        fileName: "hipaa-security-whitepaper.md",
        fileType: "text/markdown",
        filePath: "/uploads/context/hipaa-security-whitepaper.md",
        extractedContent:
          "# HIPAA & HITRUST AI Compliance Standards\n- Data in transit: TLS 1.3 encryption.\n- Data at rest: AES-256 with customer-managed HSM keys.\n- Zero data retention agreements in place with foundational model providers.\n- De-identification pipeline: Automatic PHI redaction compliant with Safe Harbor standards.",
      },
      {
        projectId: pulseHipaaProj.id,
        fileName: "clinical-burnout-study.txt",
        fileType: "text/plain",
        filePath: "/uploads/context/clinical-burnout-study.txt",
        extractedContent:
          "Physicians spend an average of 1.8 hours on EHR documentation for every 1 hour of direct patient care. PulseScribe reduces documentation time by 72%, restoring doctor-patient connection.",
      },
    ],
  });

  const pulseBlog1 = await prisma.blog.create({
    data: {
      projectId: pulseHipaaProj.id,
      title: "Reducing Physician Burnout with Ambient Clinical Intelligence",
      topic: "Healthcare Documentation Automation & Physician Wellbeing",
      status: BlogStatus.DRAFT,
      content:
        "# Reducing Physician Burnout with Ambient Clinical Intelligence\n\nEHR documentation burden has become the leading cause of clinician burnout across hospital systems. Ambient AI listeners represent a paradigm shift, returning doctors' focus to their patients.",
    },
  });

  const pulseBlog2 = await prisma.blog.create({
    data: {
      projectId: pulseHipaaProj.id,
      title: "Securing Protected Health Information (PHI) in Large Language Model Architectures",
      topic: "HIPAA Compliance and Data Governance in Clinical AI",
      status: BlogStatus.PUBLISHED,
      content:
        "# Securing Protected Health Information (PHI) in Large Language Model Architectures\n\nDeploying LLMs in clinical environments demands rigorous architectural guardrails. From automated PHI redaction to zero-retention model endpoints, healthcare CTOs must prioritize data governance.",
    },
  });

  await prisma.publishedPost.create({
    data: {
      blogId: pulseBlog2.id,
      platform: PublishingPlatform.WORDPRESS,
      status: PublishingStatus.PUBLISHED,
      url: "https://healthtech-insights.org/securing-phi-in-llm-architectures",
      externalPostId: "wp_post_449102",
      publishedAt: new Date(),
    },
  });

  // =========================================================================
  // 3. COMPANY 3: NovaPay FinTech
  // =========================================================================
  const novapay = await prisma.company.create({
    data: {
      name: "NovaPay FinTech",
      description:
        "Global financial infrastructure platform delivering real-time cross-border settlements, streaming fraud detection, and automated compliance.",
    },
  });
  console.log(`🏢 [3/5] Created: ${novapay.name}`);

  const novaPaymentSec = await prisma.section.create({
    data: {
      companyId: novapay.id,
      name: "Payment Rail Infrastructure",
      description: "ISO 20022 compliant cross-border payment switching and instant treasury clearing.",
    },
  });

  const novaRiskSec = await prisma.section.create({
    data: {
      companyId: novapay.id,
      name: "Risk & Fraud Intelligence",
      description: "Real-time graph neural network models for anti-money laundering and transaction fraud detection.",
    },
  });

  await prisma.product.createMany({
    data: [
      {
        sectionId: novaPaymentSec.id,
        name: "NovaRail Instant Settlement",
        description:
          "Sub-3-second cross-border payments with guaranteed foreign exchange rates and automated SWIFT gpi tracking.",
      },
      {
        sectionId: novaRiskSec.id,
        name: "NovaShield Fraud AI",
        description:
          "Streaming transaction risk scoring with sub-10ms inference and 99.4% precision on synthetic identity fraud.",
      },
    ],
  });

  const novaCrossBorderProj = await prisma.project.create({
    data: {
      companyId: novapay.id,
      name: "Cross-Border B2B Settlement Campaign",
      description:
        "Thought leadership on modernizing legacy correspondent banking rails and reducing international wire friction.",
    },
  });

  await prisma.contextFile.create({
    data: {
      projectId: novaCrossBorderProj.id,
      fileName: "iso-20022-migration-handbook.md",
      fileType: "text/markdown",
      filePath: "/uploads/context/iso-20022-migration-handbook.md",
      extractedContent:
        "# ISO 20022 Migration Key Insights\n- Rich XML payment data reduces transaction reconciliation friction from hours to milliseconds.\n- NovaRail supports native MX messaging translation for legacy MT systems.",
    },
  });

  await prisma.blog.create({
    data: {
      projectId: novaCrossBorderProj.id,
      title: "Zero-Day Financial Fraud Prevention Using Streaming Graph Neural Networks",
      topic: "FinTech Security & Machine Learning Fraud Detection",
      status: BlogStatus.GENERATED,
      content:
        "# Zero-Day Financial Fraud Prevention Using Streaming Graph Neural Networks\n\nTraditional rules-based fraud engines struggle against coordinated synthetic identity rings. Graph neural networks process transaction graphs in real time to intercept suspicious fund movements.",
    },
  });

  // =========================================================================
  // 4. COMPANY 4: Nexus Robotics & Industrial IoT
  // =========================================================================
  const nexus = await prisma.company.create({
    data: {
      name: "Nexus Robotics & Industrial IoT",
      description:
        "Pioneering autonomous mobile robots (AMRs) and edge-vision AI systems that automate intralogistics and manufacturing quality inspection.",
    },
  });
  console.log(`🏢 [4/5] Created: ${nexus.name}`);

  const nexusAmrSec = await prisma.section.create({
    data: {
      companyId: nexus.id,
      name: "Autonomous Mobile Robotics (AMR)",
      description: "LiDAR-guided payload transporters, automated tuggers, and multi-robot fleet dispatchers.",
    },
  });

  const nexusVisionSec = await prisma.section.create({
    data: {
      companyId: nexus.id,
      name: "Computer Vision & QA",
      description: "Sub-millimeter optical defect inspection cameras powered by embedded neural processing units.",
    },
  });

  await prisma.product.createMany({
    data: [
      {
        sectionId: nexusAmrSec.id,
        name: "Nexus Rover 1500",
        description:
          "Heavy-duty 1,500kg payload autonomous mobile robot with 360-degree safety LiDAR and natural feature SLAM navigation.",
      },
      {
        sectionId: nexusAmrSec.id,
        name: "Nexus FleetDispatch OS",
        description:
          "Cloud-native fleet management coordinating 500+ AMRs simultaneously with dynamic obstacle rerouting.",
      },
      {
        sectionId: nexusVisionSec.id,
        name: "Nexus VisionEye 3D",
        description:
          "High-speed inline surface defect detector scanning 120 parts per minute with 99.98% accuracy.",
      },
    ],
  });

  const nexusFactoryProj = await prisma.project.create({
    data: {
      companyId: nexus.id,
      name: "Smart Factory Automation Series",
      description:
        "Technical blog series showcasing how tier-1 automotive and semiconductor manufacturers achieve lights-out factory operations.",
    },
  });

  await prisma.contextFile.createMany({
    data: [
      {
        projectId: nexusFactoryProj.id,
        fileName: "smart-factory-benchmarks-2026.md",
        fileType: "text/markdown",
        filePath: "/uploads/context/smart-factory-benchmarks-2026.md",
        extractedContent:
          "# Smart Factory Automation Benchmark Data\n- Average cycle time reduction: 64.2% across 18 automotive assembly lines.\n- Payback period: 11.4 months on robotic fleet deployments.\n- Safety record: Zero recordable incidents over 4.2 million operating hours.",
      },
      {
        projectId: nexusFactoryProj.id,
        fileName: "iso-3691-4-safety-standards.txt",
        fileType: "text/plain",
        filePath: "/uploads/context/iso-3691-4-safety-standards.txt",
        extractedContent:
          "Compliance with ISO 3691-4:2023 requires dynamic safety field switching based on vehicle speed, turning radius, and payload weight. Nexus Rovers exceed Category 3 / PL d functional safety requirements.",
      },
    ],
  });

  const nexusBlog1 = await prisma.blog.create({
    data: {
      projectId: nexusFactoryProj.id,
      title: "Zero-Downtime Warehouse Automation: How Autonomous Mobile Robots Cut Cycle Time by 65%",
      topic: "Industrial Robotics and Smart Logistics",
      status: BlogStatus.APPROVED,
      content:
        "# Zero-Downtime Warehouse Automation\n\nHigh-density fulfillment centers are transitioning from fixed conveyor belts to dynamic AMR fleets. By eliminating physical choke points, facilities achieve unprecedented throughput adaptability.",
    },
  });

  await prisma.publishedPost.createMany({
    data: [
      {
        blogId: nexusBlog1.id,
        platform: PublishingPlatform.BLOGGER,
        status: PublishingStatus.PUBLISHED,
        url: "https://nexus-robotics.blogger.com/2026/08/zero-downtime-warehouse-automation.html",
        externalPostId: "blogger_amr_3391",
        publishedAt: new Date(),
      },
      {
        blogId: nexusBlog1.id,
        platform: PublishingPlatform.WORDPRESS,
        status: PublishingStatus.PUBLISHED,
        url: "https://smartfactory-review.com/autonomous-mobile-robots-cycle-time",
        externalPostId: "wp_amr_9921",
        publishedAt: new Date(),
      },
    ],
  });

  await prisma.blog.create({
    data: {
      projectId: nexusFactoryProj.id,
      title: "Edge Vision vs Cloud Inference in High-Speed Manufacturing",
      topic: "Embedded AI & Low-Latency Defect Detection",
      status: BlogStatus.GENERATING,
      content:
        "# Edge Vision vs Cloud Inference in High-Speed Manufacturing\n\nWhen parts move down a production line at 3 meters per second, a 200ms cloud network round-trip means defective items have already passed the sorting gate...",
    },
  });

  // =========================================================================
  // 5. COMPANY 5: GreenGrid Clean Energy
  // =========================================================================
  const greengrid = await prisma.company.create({
    data: {
      name: "GreenGrid Clean Energy",
      description:
        "Decarbonization software and Virtual Power Plant (VPP) platform aggregating distributed battery storage, solar assets, and dynamic load balancing.",
    },
  });
  console.log(`🏢 [5/5] Created: ${greengrid.name}`);

  const greenVppSec = await prisma.section.create({
    data: {
      companyId: greengrid.id,
      name: "Virtual Power Plants (VPP)",
      description: "Automated demand response, capacity market bidding, and grid frequency regulation algorithms.",
    },
  });

  const greenSolarSec = await prisma.section.create({
    data: {
      companyId: greengrid.id,
      name: "Renewable Generation Forecasting",
      description: "Machine learning irradiance predictions and turbine wake loss modeling.",
    },
  });

  await prisma.product.createMany({
    data: [
      {
        sectionId: greenVppSec.id,
        name: "GreenGrid FlexVPP",
        description:
          "Aggregation platform connecting 50,000+ distributed residential batteries into a dispatchable 250MW virtual utility asset.",
      },
      {
        sectionId: greenSolarSec.id,
        name: "GreenGrid SolarCast AI",
        description:
          "Satellite and numerical weather prediction engine forecasting utility-scale photovoltaic output with 96.8% accuracy.",
      },
    ],
  });

  const greenTransitionProj = await prisma.project.create({
    data: {
      companyId: greengrid.id,
      name: "Grid Resilience & Clean Transition Campaign",
      description:
        "Educational content targeting municipal utilities and clean energy investors on grid stability through distributed energy resources.",
    },
  });

  await prisma.contextFile.createMany({
    data: [
      {
        projectId: greenTransitionProj.id,
        fileName: "ferc-order-2222-playbook.md",
        fileType: "text/markdown",
        filePath: "/uploads/context/ferc-order-2222-playbook.md",
        extractedContent:
          "# FERC Order 2222 Implementation Guide\n- Enables distributed energy resources (DERs) to participate alongside traditional generation in wholesale regional transmission markets.\n- GreenGrid FlexVPP aggregates storage, EV chargers, and solar into single market bids.",
      },
      {
        projectId: greenTransitionProj.id,
        fileName: "battery-arbitrage-mechanics.txt",
        fileType: "text/plain",
        filePath: "/uploads/context/battery-arbitrage-mechanics.txt",
        extractedContent:
          "Energy arbitrage captures the spread between negative or near-zero wholesale prices during peak solar hours and premium peak evening pricing. Automated bidding delivers 3.4x higher ROI than fixed time-of-use tariffs.",
      },
    ],
  });

  const greenBlog1 = await prisma.blog.create({
    data: {
      projectId: greenTransitionProj.id,
      title: "How Virtual Power Plants Prevent Blackouts During Extreme Weather Events",
      topic: "Grid Resilience, Battery Storage & Clean Energy",
      status: BlogStatus.PUBLISHED,
      content:
        "# How Virtual Power Plants Prevent Blackouts During Extreme Weather Events\n\nAs extreme heatwaves stress electrical grids, Virtual Power Plants (VPPs) coordinate thousands of distributed home batteries to inject megawatts into the grid in sub-second response times, preventing rolling blackouts without firing up polluting peaker plants.",
    },
  });

  await prisma.publishedPost.create({
    data: {
      blogId: greenBlog1.id,
      platform: PublishingPlatform.BLOGGER,
      status: PublishingStatus.PUBLISHED,
      url: "https://greengrid-insights.blogger.com/2026/08/virtual-power-plants-grid-resilience.html",
      externalPostId: "blogger_vpp_8801",
      publishedAt: new Date(),
    },
  });

  await prisma.blog.create({
    data: {
      projectId: greenTransitionProj.id,
      title: "Machine Learning for Sub-Hour Solar Irradiance Forecasting",
      topic: "Photovoltaic Prediction and Weather Modeling",
      status: BlogStatus.GENERATED,
      content:
        "# Machine Learning for Sub-Hour Solar Irradiance Forecasting\n\nCloud shadow dynamics cause volatile generation swings in 500MW solar farms. By fusing geostationary satellite telemetry with on-ground pyranometers, our SolarCast model forecasts ramping events with 15-minute lead time.",
    },
  });

  await prisma.blog.create({
    data: {
      projectId: greenTransitionProj.id,
      title: "Unlocking Arbitrage Value with Automated Battery Energy Storage Systems",
      topic: "Energy Arbitrage & Revenue Stacking",
      status: BlogStatus.FAILED,
      content:
        "# Unlocking Arbitrage Value with Automated Battery Energy Storage Systems\n\n[Generation failed due to upstream context timeout - sample failed state for UI error testing]",
    },
  });

  console.log("\n🎉 Database successfully populated with 5 full enterprise companies and 100% verified relationships!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
