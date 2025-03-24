export const csvStrangeChars = {
  "index.js": `
        import data from './data.csv';
        console.log(data)
        export { data };
      `,
  "data.csv": `Country,Users,New users,Engaged sessions,Engagement rate,Engaged sessions per user,Average engagement time,Event count,Conversions,Total revenue
        Türkiye,180,177,133,0.5450819672131147,0.7388888888888889,86.22777777777777,1007,0,0
        (not set),28,27,2,0.06896551724137931,0.07142857142857142,7.178571428571429,101,0,0
        Myanmar (Burma),11,11,29,0.58,2.6363636363636362,141.0909090909091,209,0,0
        Côte d'Ivoire,10,10,8,0.6666666666666666,0.8,33.4,57,0,0
        Réunion,1,1,0,0,0,0,5,0,0`,
};
