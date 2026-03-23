// Nutritionist Profiles Data

export interface Nutritionist {
  id: string;
  slug: string;
  name: string;
  title: string;
  photo: string;
  bio: string;
  certifications: string[];
  specializations: string[];
  experience: number;
  blogs: { title: string; summary: string }[];
  videos: { title: string; url: string; description: string }[];
  tips: string[];
}

export const nutritionists: Nutritionist[] = [
  {
    id: '1',
    slug: 'dr-ananya-sharma',
    name: 'Dr. Ananya Sharma',
    title: 'Clinical Nutritionist & Wellness Expert',
    photo: '/nutritionists/ananya.jpg',
    bio: 'Dr. Ananya Sharma is a renowned clinical nutritionist with over 15 years of experience in therapeutic nutrition and holistic wellness. She holds a PhD in Nutritional Sciences from AIIMS and has worked with thousands of patients to help them achieve their health goals through personalized dietary interventions. Her approach combines evidence-based nutrition with traditional Indian dietary wisdom, creating sustainable eating plans that respect cultural food preferences.',
    certifications: [
      'PhD in Nutritional Sciences, AIIMS',
      'Certified Sports Nutritionist (ISSN)',
      'Registered Dietitian (RD)',
      'Certificate in Plant-Based Nutrition, Cornell University',
    ],
    specializations: [
      'Therapeutic Nutrition',
      'Weight Management',
      'Diabetes Management',
      'Sports Nutrition',
      'Gut Health',
    ],
    experience: 15,
    blogs: [
      { title: 'The Power of Whole Foods in Managing Chronic Conditions', summary: 'Exploring how whole, unprocessed foods serve as medicine for the body and support long-term health outcomes.' },
      { title: 'Understanding Macronutrients for Optimal Health', summary: 'A comprehensive guide to balancing proteins, carbohydrates, and fats in your daily diet.' },
      { title: 'Anti-Inflammatory Diet: A Complete Guide', summary: 'How dietary choices can reduce chronic inflammation and support immune function.' },
    ],
    videos: [
      { title: 'Meal Prep for Busy Professionals', url: 'https://www.youtube.com/watch?v=gQ13c3lznFM', description: 'Learn how to prepare a full week of nutritious meals in just 2 hours.' },
      { title: 'Reading Nutrition Labels Like a Pro', url: 'https://www.youtube.com/watch?v=R-o-83k8dP0', description: 'Decode food labels and make informed choices at the grocery store.' },
    ],
    tips: [
      'Start each morning with a glass of warm water and lemon to kickstart digestion.',
      'Include at least 5 different colored vegetables in your daily meals.',
      'Practice mindful eating by putting away all screens during meals.',
      'Stay hydrated throughout the day - aim for at least 8 glasses of water.',
      'Include a source of protein with every meal to maintain stable blood sugar levels.',
    ],
  },
  {
    id: '2',
    slug: 'rajesh-kumar',
    name: 'Rajesh Kumar',
    title: 'Sports Nutritionist & Fitness Coach',
    photo: '/nutritionists/rajesh.jpg',
    bio: 'Rajesh Kumar is an accomplished sports nutritionist and certified fitness coach who specializes in performance nutrition for athletes and fitness enthusiasts. With a background in exercise physiology and nutrition science, he has helped numerous professional athletes optimize their performance through strategic dietary planning. His expertise in muscle building, fat loss, and recovery nutrition makes him a sought-after consultant in the sports industry.',
    certifications: [
      'MSc in Exercise Physiology, Loughborough University',
      'Certified Strength & Conditioning Specialist (CSCS)',
      'Precision Nutrition Coach (Pn1)',
      'Certified Sports Performance Coach',
    ],
    specializations: [
      'Sports Performance Nutrition',
      'Muscle Building & Body Composition',
      'Endurance Athlete Nutrition',
      'Recovery Nutrition',
      'Supplement Science',
    ],
    experience: 12,
    blogs: [
      { title: 'Pre and Post Workout Nutrition Timing', summary: 'Optimize your exercise results by understanding exactly when and what to eat around your workouts.' },
      { title: 'Building Muscle on a Vegetarian Diet', summary: 'Complete guide to meeting protein needs and building lean muscle mass without meat.' },
    ],
    videos: [
      { title: 'High-Protein Meal Planning', url: 'https://www.youtube.com/watch?v=Ecpc0GHbO_M', description: 'Step-by-step guide to creating protein-rich meal plans for muscle growth.' },
      { title: 'Understanding Supplements: What Works', url: 'https://www.youtube.com/watch?v=gexpGeSvAxk', description: 'Evidence-based review of common fitness supplements and their effectiveness.' },
    ],
    tips: [
      'Consume protein within 30 minutes after your workout for optimal recovery.',
      'Track your caloric intake for at least one week to understand your baseline.',
      'Complex carbohydrates before exercise provide sustained energy.',
      'Quality sleep is as important as diet for muscle recovery.',
    ],
  },
  {
    id: '3',
    slug: 'dr-priya-patel',
    name: 'Dr. Priya Patel',
    title: 'Ayurvedic Nutrition Specialist',
    photo: '/nutritionists/priya.jpg',
    bio: 'Dr. Priya Patel bridges the gap between modern nutritional science and ancient Ayurvedic wisdom. With dual qualifications in conventional dietetics and Ayurvedic medicine, she offers a unique perspective on personalized nutrition based on individual body constitution (dosha). She believes that food is the most powerful form of medicine and advocates for a holistic approach to eating that nourishes both body and mind.',
    certifications: [
      'BAMS (Bachelor of Ayurvedic Medicine and Surgery)',
      'MSc in Clinical Nutrition',
      'Certified Ayurvedic Practitioner',
      'Yoga Alliance Registered Teacher (RYT 500)',
    ],
    specializations: [
      'Ayurvedic Nutrition',
      'Dosha-Based Diet Planning',
      'Digestive Health',
      'Hormonal Balance',
      'Mind-Body Nutrition',
    ],
    experience: 10,
    blogs: [
      { title: 'Eating According to Your Dosha', summary: 'Discover your Ayurvedic body type and learn which foods will bring you into optimal balance.' },
      { title: 'The Healing Power of Indian Kitchen Spices', summary: 'How turmeric, cumin, and other everyday spices support digestive health and immunity.' },
      { title: 'Seasonal Eating: An Ayurvedic Approach', summary: 'Aligning your diet with nature s seasons for better digestion and overall health.' },
    ],
    videos: [
      { title: 'Ayurvedic Morning Routine for Digestion', url: 'https://www.youtube.com/watch?v=0-S3NIR-4-c', description: 'Start your day with these Ayurvedic practices for optimal digestive fire.' },
    ],
    tips: [
      'Eat your largest meal at midday when digestive fire is strongest.',
      'Sip warm water throughout the day instead of cold beverages.',
      'Include all six tastes (sweet, sour, salty, bitter, pungent, astringent) in each meal.',
      'Allow at least 3 hours between meals for proper digestion.',
      'Cook with ghee - it supports digestion and nutrient absorption.',
    ],
  },
  {
    id: '4',
    slug: 'dr-meera-krishnan',
    name: 'Dr. Meera Krishnan',
    title: 'Pediatric Nutritionist & Family Health Advisor',
    photo: '/nutritionists/meera.jpg',
    bio: 'Dr. Meera Krishnan is a dedicated pediatric nutritionist who specializes in childhood nutrition and family wellness. With extensive experience in managing childhood obesity, picky eating, and developmental nutrition, she helps families build healthy eating habits that last a lifetime. Her compassionate and practical approach makes nutrition accessible to families from all backgrounds.',
    certifications: [
      'MD in Pediatrics',
      'Certified Pediatric Nutritionist',
      'Certificate in Childhood Obesity Management',
      'Lactation Consultant (IBCLC)',
    ],
    specializations: [
      'Pediatric Nutrition',
      'Childhood Obesity Prevention',
      'Family Meal Planning',
      'Infant and Toddler Nutrition',
      'School Nutrition Programs',
    ],
    experience: 14,
    blogs: [
      { title: 'Healthy Lunch Box Ideas for School Children', summary: 'Creative and nutritious lunch ideas that children will actually enjoy eating.' },
      { title: 'Managing Picky Eating in Toddlers', summary: 'Evidence-based strategies to expand your child s palate without mealtime battles.' },
    ],
    videos: [
      { title: 'Age-Appropriate Portion Sizes', url: 'https://www.youtube.com/watch?v=Q7w-PbTW7DQ', description: 'Visual guide to understanding how much food children need at different ages.' },
    ],
    tips: [
      'Lead by example - children mimic the eating behaviors of their parents.',
      'Introduce new foods alongside familiar favorites to reduce resistance.',
      'Make mealtimes a screen-free, family activity.',
      'Involve children in age-appropriate cooking and food preparation.',
    ],
  },
];

export function getNutritionistBySlug(slug: string): Nutritionist | undefined {
  return nutritionists.find(n => n.slug === slug);
}
