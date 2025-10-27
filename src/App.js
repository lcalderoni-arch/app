  //src/App.js
import { useRoutes } from 'react-router-dom';
// 1. Importa la configuración de rutas
import routeConfig from './routeConfig.js'; 
// 2. Importa tu CSS global
import "./App.css"; 

function App() {
  // 3. useRoutes genera el elemento a renderizar
  const element = useRoutes(routeConfig); 

  // 4. Renderiza el resultado
  return element; 
}

export default App;

