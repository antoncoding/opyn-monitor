import ReactGA from 'react-ga';
const projectId = process.env.REACT_APP_GA_PROJECT_ID || ''
ReactGA.initialize(projectId);

export default ReactGA;
