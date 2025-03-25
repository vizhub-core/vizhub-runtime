export const csvImport = {
  "index.js": `
    import data from './data.csv';
    console.log(data[0].variety);
  `,
  "data.csv": `"sepal.length","sepal.width","petal.length","petal.width","variety"
5.1,3.5,1.4,.2,"Setosa"
4.9,3,1.4,.2,"Setosa"
4.7,3.2,1.3,.2,"Setosa"
4.6,3.1,1.5,.2,"Setosa"`,
};
