const BOTANICA_DATA = {
  // 1. EL GANCHO (LA IDEA CENTRAL)
  hook: {
    title: "El Gancho: Automatización del Cuidado de Plantas",
    subtitle: "El primer e-commerce de suscripción mensual en España con un kit de autor estacional",
    cause: {
      tag: "LO QUE PRESENTAS (LA IDEA)",
      heading: "Botánica Club: Cuidado de plantas de interior en piloto automático",
      description: "Un servicio de suscripción mensual que envía directamente al hogar la dosis viva y exacta de nutrientes, enmiendas orgánicas y accesorios de diseño necesarios para mantener plantas sanas sin esfuerzo ni conocimientos previos.",
      highlights: [
        "Suscripción flexible sin permanencia (24,90 € / mes)",
        "Dosis calibrada por expertos agrónomos según el fotoperiodo de España",
        "Formato ultraligero que cabe en cualquier buzón o felpudo de apartamento"
      ]
    },
    effect: {
      tag: "LA RAZÓN DE PESO (POR QUÉ FUNCIONA)",
      heading: "Eliminación radical del dolor nº 1 del mercado: La Frustración y el Miedo",
      description: "El 68% de las personas no compra más plantas de interior porque temen que se les mueran por regar de más, de menos o abonar mal. Nosotros no vendemos abono: vendemos la paz mental de saber que tus plantas sobrevivirán y prosperarán.",
      metrics: [
        { label: "Miedo a la muerte de plantas", value: "68%", note: "Dolor primordial erradicado" },
        { label: "Decisiones que debe tomar el usuario", value: "0", note: "Todo viene pre-medido y fechado" },
        { label: "Retención estimada a 12 meses", value: "64%", note: "Impulsada por el éxito botánico" }
      ]
    }
  },

  // 2. RADIOGRAFÍA DEL PRODUCTO
  product: {
    boxDimensions: {
      width: 25,
      length: 18,
      height: 10,
      weight: "720g (Menos de 800g)",
      packaging: "Cartón Kraft 100% reciclado y compostable con tintas vegetales al agua"
    },
    items: [
      {
        id: "nutricion",
        name: "Nutrición Líquida del Mes",
        icon: "droplet",
        detail: "Concentrado biológico bio-estimulante en frasco de vidrio ámbar de 60ml con pipeta dosificadora milimétrica.",
        whyWorks: "La dosis exacta del mes elimina el riesgo de quemar raíces por exceso de nitrógeno. Una planta sana genera adicción y fidelidad."
      },
      {
        id: "enmienda",
        name: "Enmienda de Tierra Compacta",
        icon: "disc",
        detail: "Pastilla deshidratada de fibra de coco + humus de lombriz + perlita. Se expande con 1 vaso de agua hasta 1 litro de sustrato premium.",
        whyWorks: "Elimina el absurdo de almacenar sacos de 20 litros de tierra en un piso de 60m². Comodidad extrema para hogares urbanos."
      },
      {
        id: "accesorio",
        name: "Herramienta o Accesorio Coleccionable",
        icon: "sparkles",
        detail: "Piezas de diseño nórdico/mediterráneo coleccionables: tijeras de poda mini en latón, pulverizador vintage de cristal, medidor cerámico de humedad, tutores modulares.",
        whyWorks: "Genera el efecto 'Caja Sorpresa' coleccionable. Al no repetirse nunca, transforma un gasto de mantenimiento en un regalo de diseño."
      },
      {
        id: "qr",
        name: "Tarjeta con QR: 'Doctor Planta' WhatsApp",
        icon: "message-circle",
        detail: "Acceso ilimitado por WhatsApp con botánicos en plantilla. Envía una foto de tu hoja amarilla y recibe diagnóstico en minutos.",
        whyWorks: "Crea una barrera defensiva insuperable frente a gigantes como Leroy Merlin o Amazon: un vínculo humano hiper-personalizado que reduce el Churn al mínimo."
      }
    ],
    seasons: [
      {
        id: "primavera",
        name: "Primavera · Despertar & Brotación",
        accent: "#4E9F3D",
        focus: "Rico en Nitrógeno y Fósforo para acelerar nuevas hojas",
        boxContent: "Bioestimulante de brotación + Disco de humus activo + Tijeras de precisión en latón dorado + Guía de esquejes."
      },
      {
        id: "verano",
        name: "Verano · Hidratación & Resistencia Térmica",
        accent: "#E28743",
        focus: "Retención de humedad y protección frente a olas de calor",
        boxContent: "Extracto de algas marinas marinas anti-estrés térmico + Polímero biodegradable de agua + Pulverizador de cristal ámbar vintage."
      },
      {
        id: "otono",
        name: "Otoño · Fortalecimiento Radicular",
        accent: "#C15C3D",
        focus: "Preparación de raíces y prevención de hongos otoñales",
        boxContent: "Micorrizas vivas + Sustrato aireado con perlita + Medidor de humedad de terracota + Jabón potásico preventivo."
      },
      {
        id: "invierno",
        name: "Invierno · Reposo & Luz Vegetal",
        accent: "#3D7068",
        focus: "Micro-dosis de bajo consumo y limpieza foliar para máxima luz",
        boxContent: "Tónico limpiador de hojas con aceite de neem + Pincel botánico de cerdas naturales + Tutor de fibra de coco modular."
      }
    ],
    financialPillars: {
      churn: "< 7%",
      churnReason: "Variedad estacional: el cliente nunca recibe duplicados ni se aburre del contenido.",
      grossMargin: "> 60%",
      marginReason: "Peso <800g y volumen de 4,5L: costes de envío en España de solo 2,80€ - 3,10€ con Correos Express / GLS."
    }
  },

  // 3. CONTEXTO DEMOGRÁFICO Y ESTILO DE VIDA (ESPAÑA)
  demographics: {
    stats: [
      {
        number: "81,9%",
        title: "Población Urbana en España",
        source: "Instituto Nacional de Estadística (INE)",
        detail: "Más de 39 millones de personas viven en pisos y edificios residenciales sin jardín exterior propio.",
        impact: "Viviendas verticales sin espacio para sacos de tierra, pero con terrazas, balcones y salones repletos de plantas en maceta."
      },
      {
        number: "44,3 años",
        title: "Edad Mediana con Alto Poder Adquisitivo",
        source: "Eurostat / INE 2024",
        detail: "Perfil con ingresos consolidados que invierte en 'Home Nesting' y decoración biofílica para su bienestar mental.",
        impact: "Dispuestos a pagar 24,90 € al mes por la comodidad y estética de tener un salón de revista de decoración sin complicaciones."
      },
      {
        number: "96,4%",
        title: "Penetración de Internet y E-Commerce",
        source: "ONTSI / ONTSI E-commerce Report",
        detail: "España es uno de los países europeos con mayor adopción de smartphones, banca digital y suscripciones a domicilio.",
        impact: "Fricción de suscripción prácticamente nula mediante Apple Pay, Google Pay y Bizum Recurrente."
      }
    ],
    cities: [
      { name: "Madrid", urbanPcts: "94%", households: "1.4M pisos", plantsEstimated: "5.2M plantas" },
      { name: "Barcelona", urbanPcts: "96%", households: "1.1M pisos", plantsEstimated: "4.1M plantas" },
      { name: "Valencia", urbanPcts: "89%", households: "480k pisos", plantsEstimated: "1.7M plantas" },
      { name: "Sevilla", urbanPcts: "86%", households: "390k pisos", plantsEstimated: "1.4M plantas" },
      { name: "Bilbao", urbanPcts: "92%", households: "210k pisos", plantsEstimated: "850k plantas" },
      { name: "Málaga", urbanPcts: "88%", households: "310k pisos", plantsEstimated: "1.1M plantas" }
    ]
  },

  // 4. ESTRATEGIA DE ADQUISICIÓN (VIRALIDAD VISUAL)
  acquisition: {
    channels: [
      {
        platform: "Instagram",
        usersSpain: "24,8 Millones",
        contentFocus: "Unboxing estético ASMR, tours de pisos botánicos ('Plant House Tour'), fotos de antes y después.",
        cpaTarget: "4,20 € - 5,80 €"
      },
      {
        platform: "TikTok",
        usersSpain: "19,2 Millones",
        contentFocus: "Mini-tutoriales de 20s de 'Doctor Planta', dramas resueltos ('Iba a tirar mi Monstera pero hice esto').",
        cpaTarget: "3,10 € - 4,50 €"
      },
      {
        platform: "WhatsApp & Referidos",
        usersSpain: "33,0 Millones",
        contentFocus: "'Invita a un amigo botánico y ambos os lleváis un esqueje raro gratis'.",
        cpaTarget: "0,00 € (K-factor = 1.35)"
      }
    ],
    comparison: {
      traditionalRetail: {
        title: "Viveros y Tiendas Tradicionales",
        cac: "35 € - 45 €",
        frequency: "1 o 2 visitas al año",
        friction: "Cargar coche, ensuciar maletero, falta de asesoramiento posventa."
      },
      botanicaClub: {
        title: "Botánica Club (Suscripción D2C)",
        cac: "< 5,50 €",
        frequency: "12 recurrencias anuales",
        friction: "Llega directo al felpudo sin ensuciar ni cargar nada."
      }
    }
  },

  // 5. NÚMEROS DEL NEGOCIO (UNIT ECONOMICS & MVP)
  financials: {
    unitEconomics: {
      ticketMonth: 24.90,
      breakdown: [
        { item: "Nutrición líquida (Frasco ámbar 60ml)", cost: 1.85, pct: 7.4 },
        { item: "Enmienda sustrato compactado (Pastilla coco+humus)", cost: 0.95, pct: 3.8 },
        { item: "Accesorio de diseño coleccionable (Directo fábrica)", cost: 2.40, pct: 9.6 },
        { item: "Caja kraft serigrafiada + inserto ecológico", cost: 1.10, pct: 4.4 },
        { item: "Envío nacional <800g (Correos / GLS)", cost: 2.90, pct: 11.6 },
        { item: "Pasarela de pago Stripe (1.5% + 0.25€)", cost: 0.62, pct: 2.5 },
        { item: "Soporte WhatsApp Doctor Planta", cost: 0.50, pct: 2.0 },
        { item: "MARGEN BRUTO NETO POR CAJA", cost: 14.58, pct: 58.6, isProfit: true }
      ]
    },
    mvpBudget: {
      total: 3500,
      breakdown: [
        { concept: "Lote Inicial 150 Cajas Piloto (Packaging + Producto)", amount: 1250, pct: 35.7 },
        { concept: "Desarrollo Web & Integración Stripe Billing Recurrente", amount: 750, pct: 21.4 },
        { concept: "Siembra con 15 Micro-influencers de Plantas + Ads TikTok", amount: 1000, pct: 28.6 },
        { concept: "WhatsApp Business API & Licencias iniciales", amount: 250, pct: 7.1 },
        { concept: "Fondo de contingencia y stock de seguridad", amount: 250, pct: 7.1 }
      ]
    },
    defaultCalculations: {
      subscribers: 600,
      churnRate: 0.065, // 6.5%
      cac: 5.50
    }
  },

  // DOCTOR PLANTA - DIÁLOGOS DE MUESTRA PARA EL SIMULADOR
  doctorPlantaScenarios: [
    {
      trigger: "🌿 Hojas amarillas en Monstera",
      userMsg: "¡Hola Doctor Planta! Tengo mi Monstera Deliciosa en el salón y de repente dos hojas bajas se han puesto completamente amarillas con manchas marrones. ¿Qué hago?",
      botMsg: "¡Hola Sara! Tranquila, que tiene solución rápida. 🌿 Analizando tu foto:\n\n1. Es un clásico caso de estrés hídrico por exceso de agua retenida en el fondo de la maceta (falta de drenaje con las temperaturas de otoño).\n2. Solución inmediata: No riegues en 8 días. En la caja de este mes tienes el Disco de Enmienda con perlita: añádelo en la capa superficial para airear las raíces.\n3. Añade 4 gotas de la Nutrición Líquida de Noviembre en el próximo riego. ¡En 10 días verás brotar una hoja nueva fenestrada!",
      recommendedAction: "Aplicar Nutrición de Noviembre (4 gotas) + Oxigenar sustrato"
    },
    {
      trigger: "🦟 Bichitos blancos en el envés (Plaga)",
      userMsg: "Ayuda urgente... acabo de ver una especie de pelusilla blanca pegajosa en los tallos de mi Pothos. ¿Se va a morir?",
      botMsg: "¡Identificado! Es cochinilla algodonera. Actuemos rápido:\n\n1. Con el pincel botánico de tu kit, limpia con una mezcla de agua y alcohol al 70% cada tallo afectado.\n2. Pulveriza la solución de jabón potásico y neem que te enviamos este mes una vez al caer el sol.\n3. Repite en 5 días. ¡Estará 100% libre de plagas sin químicos tóxicos en tu casa!",
      recommendedAction: "Usar Pincel del Kit + Pulverizado al atardecer"
    },
    {
      trigger: "🍂 Puntas secas y quebradizas en Calathea",
      userMsg: "Mi Calathea Orbifolia tiene las puntas de las hojas como papel quemado y crujiente. La riego una vez a la semana.",
      botMsg: "La Calathea es la reina del drama de la humedad ambiental. 💧\n\nEl problema no es el riego en la tierra, sino la sequedad del aire por la calefacción de la ciudad.\n\n✨ Receta del Doctor Planta: Llena el pulverizador de latón de tu kit con agua reposada (sin cloro) y rocía las hojas cada mañana a 30 cm de distancia. ¡Recuperará el brillo elástico en 48 horas!",
      recommendedAction: "Pulverizado matutino con el pulverizador de latón coleccionable"
    }
  ]
};

// Export to window
if (typeof window !== 'undefined') {
  window.BOTANICA_DATA = BOTANICA_DATA;
}
