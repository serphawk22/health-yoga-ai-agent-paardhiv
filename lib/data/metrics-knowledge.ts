// Health Metrics Knowledge Data

export interface MetricKnowledge {
  slug: string;
  name: string;
  icon: string;
  color: string;
  whatItMeans: string;
  whyImportant: string;
  whatWeLean: string;
  normalRange: string;
  deviceName: string;
  deviceDescription: string;
  amazonLink: string;
  measurementGuide: string[];
  videoUrl: string;
  videoTitle: string;
}

export const metricsKnowledge: MetricKnowledge[] = [
  {
    slug: 'blood-pressure',
    name: 'Blood Pressure',
    icon: 'Heart',
    color: 'red',
    whatItMeans: 'Blood pressure is a measure of how strongly your blood pushes against the walls of your blood vessels as your heart pumps it around your body. It is recorded as two numbers: the top number (systolic) measures the pressure when your heart beats, and the bottom number (diastolic) measures the pressure when your heart rests between beats. A reading of 120/80 mmHg is considered normal for most adults.',
    whyImportant: 'If your blood pressure stays too high for a long time, it can damage your heart, blood vessels, kidneys, and other organs. High blood pressure often has no symptoms, which is why it is sometimes called the "silent killer." Regular monitoring helps catch problems early, before they lead to serious health issues like heart attack, stroke, or kidney disease.',
    whatWeLean: 'By tracking your blood pressure over time, you can see patterns and understand how your lifestyle choices affect your cardiovascular health. You can identify if medications are working, if stress is impacting your numbers, or if dietary changes are making a positive difference. Consistent tracking gives you and your doctor the data needed to make informed decisions about your health.',
    normalRange: 'Normal: Below 120/80 mmHg. Elevated: 120-129 / less than 80. High: 130/80 or above.',
    deviceName: 'Digital Blood Pressure Monitor',
    deviceDescription: 'An automatic upper arm blood pressure monitor that provides accurate readings at home. Easy to use with one-button operation and large display.',
    amazonLink: 'https://www.amazon.in/s?k=blood+pressure+monitor',
    measurementGuide: [
      'Sit quietly for 5 minutes before taking a reading.',
      'Place the cuff on your bare upper arm, about 1 inch above the elbow bend.',
      'Keep your arm supported at heart level on a table or armrest.',
      'Sit with your back supported and feet flat on the floor.',
      'Press the start button and remain still while the cuff inflates.',
      'Record both numbers (systolic/diastolic) and the date.',
      'Take 2-3 readings one minute apart and note the average.',
    ],
    videoUrl: 'https://www.youtube.com/watch?v=mfwBpBXUYHs',
    videoTitle: 'How to Measure Blood Pressure at Home Correctly',
  },
  {
    slug: 'blood-sugar',
    name: 'Blood Sugar',
    icon: 'Droplets',
    color: 'purple',
    whatItMeans: 'Blood sugar, also known as blood glucose, is the amount of sugar (glucose) present in your blood at any given time. Glucose comes from the food you eat and is your body\'s main source of energy. Your body uses a hormone called insulin to move glucose from your blood into your cells where it can be used for energy.',
    whyImportant: 'Keeping your blood sugar within a healthy range is essential for your overall wellbeing. When blood sugar stays too high for too long (a condition called diabetes), it can damage your eyes, nerves, kidneys, and heart over time. Even without diabetes, understanding your blood sugar patterns helps you make better food choices and maintain steady energy levels throughout the day.',
    whatWeLean: 'Regular blood sugar monitoring helps you understand how different foods, activities, stress, and sleep patterns affect your glucose levels. You can learn which meals cause blood sugar spikes, how exercise helps bring levels down, and what time of day your readings tend to be highest. This information empowers you to make lifestyle choices that keep your blood sugar stable and your energy consistent.',
    normalRange: 'Fasting: 70-100 mg/dL. After meals (2 hours): Below 140 mg/dL. Pre-diabetes: Fasting 100-125 mg/dL.',
    deviceName: 'Blood Glucose Monitor Kit',
    deviceDescription: 'A compact glucometer with test strips and lancets for accurate blood sugar testing at home. Features include digital display, memory storage, and quick results.',
    amazonLink: 'https://www.amazon.in/s?k=blood+glucose+monitor',
    measurementGuide: [
      'Wash and dry your hands thoroughly before testing.',
      'Insert a new test strip into the glucometer.',
      'Use the lancet device to prick the side of your fingertip.',
      'Gently squeeze your finger to get a small drop of blood.',
      'Touch the drop of blood to the edge of the test strip.',
      'Wait for the meter to display your reading (usually 5-10 seconds).',
      'Record your reading along with the time and any notes about meals.',
    ],
    videoUrl: 'https://www.youtube.com/watch?v=qAZAWBJfCqs',
    videoTitle: 'How to Check Your Blood Sugar at Home',
  },
  {
    slug: 'weight',
    name: 'Body Weight',
    icon: 'Scale',
    color: 'blue',
    whatItMeans: 'Body weight is simply how much your body weighs, measured in kilograms or pounds. While it is just one number, it reflects the combined weight of your bones, muscles, organs, body fat, and water. Your weight naturally fluctuates throughout the day due to food intake, hydration levels, and other factors.',
    whyImportant: 'Maintaining a healthy body weight reduces your risk of many chronic conditions, including heart disease, type 2 diabetes, high blood pressure, and certain types of cancer. Weight tracking over time helps you understand trends rather than getting caught up in daily fluctuations. It is most useful when combined with other measurements like body composition and waist circumference.',
    whatWeLean: 'Regular weight tracking helps you spot gradual changes that might otherwise go unnoticed. You can see how dietary changes, exercise routines, sleep quality, and stress levels affect your weight over weeks and months. Tracking trends rather than individual readings gives a much clearer picture of your overall health trajectory.',
    normalRange: 'Varies by height. A healthy BMI range is 18.5-24.9. Use BMI as a general guide alongside other health indicators.',
    deviceName: 'Digital Body Weight Scale',
    deviceDescription: 'A precision digital scale with large LCD display, tempered glass platform, and auto-calibration for accurate daily weight measurements.',
    amazonLink: 'https://www.amazon.in/s?k=digital+weighing+scale',
    measurementGuide: [
      'Weigh yourself at the same time each day, ideally in the morning.',
      'Weigh before eating or drinking anything.',
      'Wear minimal clothing or the same type of clothing each time.',
      'Place the scale on a firm, flat surface (not on carpet).',
      'Stand still with weight evenly distributed on both feet.',
      'Wait for the reading to stabilize before stepping off.',
      'Record the reading and track weekly averages for best insights.',
    ],
    videoUrl: 'https://www.youtube.com/watch?v=2HTvZp5rPrg',
    videoTitle: 'How to Weigh Yourself Correctly',
  },
  {
    slug: 'heart-rate',
    name: 'Heart Rate',
    icon: 'Activity',
    color: 'pink',
    whatItMeans: 'Heart rate is the number of times your heart beats per minute (bpm). Your resting heart rate is measured when you are calm and still. It tells you how efficiently your heart is working to pump blood throughout your body. A lower resting heart rate generally means your heart is working more efficiently.',
    whyImportant: 'Your heart rate is a window into your cardiovascular fitness. A consistently elevated resting heart rate may signal stress, dehydration, illness, or an underlying heart condition. Athletes and regularly active people tend to have lower resting heart rates because their hearts are stronger and can pump more blood with each beat.',
    whatWeLean: 'By monitoring your heart rate over time, you can track improvements in cardiovascular fitness, identify periods of overtraining or excessive stress, and notice early signs of illness (your resting heart rate often rises before you feel sick). Heart rate variability patterns can also reveal how well your body is recovering from exercise and managing stress.',
    normalRange: 'Resting heart rate for adults: 60-100 bpm. Well-trained athletes may have resting rates of 40-60 bpm.',
    deviceName: 'Pulse Oximeter / Fitness Tracker',
    deviceDescription: 'A fingertip pulse oximeter or wrist-based fitness tracker that continuously monitors your heart rate and oxygen levels throughout the day.',
    amazonLink: 'https://www.amazon.in/s?k=pulse+oximeter',
    measurementGuide: [
      'Sit quietly for at least 5 minutes before measuring.',
      'Place your index and middle fingers on the inside of your wrist below the thumb.',
      'Count the beats you feel for 30 seconds and multiply by 2.',
      'Alternatively, use a pulse oximeter on your fingertip for a digital reading.',
      'Measure at the same time each day for consistency.',
      'Avoid measuring right after exercise, caffeine, or a stressful event.',
      'Record your readings and note any activities or stressors.',
    ],
    videoUrl: 'https://www.youtube.com/watch?v=Kqg1XC8bc78',
    videoTitle: 'How to Check Your Heart Rate at Home',
  },
];

export function getMetricBySlug(slug: string): MetricKnowledge | undefined {
  return metricsKnowledge.find(m => m.slug === slug);
}
