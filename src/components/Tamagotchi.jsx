import { useState, useEffect } from "react";

export function Tamagotchi() {
  const [hunger, setHunger] = useState(50);
  const [happiness, setHappiness] = useState(50);
  const [health, setHealth] = useState(100);
  const [hygiene, setHygiene] = useState(50);
  const [energy, setEnergy] = useState(50);
  const [level, setLevel] = useState(1);
  const [levelProgress, setLevelProgress] = useState(0);
  const [decayRate, setDecayRate] = useState(1);
  const [coins, setCoins] = useState(0); 
  const [isCritical, setIsCritical] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [battleResult, setBattleResult] = useState(""); 

  
  const loadStateFromLocalStorage = () => {
    const savedGameState = localStorage.getItem("gameState");
    if (savedGameState) {
      const gameState = JSON.parse(savedGameState);
      setHunger(gameState.hunger);
      setHappiness(gameState.happiness);
      setHealth(gameState.health);
      setHygiene(gameState.hygiene);
      setEnergy(gameState.energy);
      setLevel(gameState.level);
      setLevelProgress(gameState.levelProgress);
      setDecayRate(gameState.decayRate);
      setCoins(gameState.coins || 0); 
    }
  };

  const saveStateToLocalStorage = () => {
    const gameState = {
      hunger,
      happiness,
      health,
      hygiene,
      energy,
      level,
      levelProgress,
      decayRate,
      coins,
    };
    localStorage.setItem("gameState", JSON.stringify(gameState));
  };

  useEffect(() => {
    loadStateFromLocalStorage();
  }, []);

  useEffect(() => {
    const handleBeforeUnload = () => saveStateToLocalStorage();
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hunger, happiness, health, hygiene, energy, level, levelProgress, decayRate, coins]);

  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      saveStateToLocalStorage();
    }, 10000); 
    return () => clearInterval(autoSaveInterval);
  }, [hunger, happiness, health, hygiene, energy, level, levelProgress, decayRate, coins]);

  // Decaimiento de barras
  useEffect(() => {
    if (gameOver) return; 
    const timer = setInterval(() => {
      setHunger((prev) => Math.max(Math.floor(prev - decayRate), 0)); 
      setHappiness((prev) => Math.max(Math.floor(prev - decayRate), 0)); 
      setHealth((prev) => Math.max(Math.floor(prev - decayRate), 0)); 
      setHygiene((prev) => Math.max(Math.floor(prev - decayRate), 0)); 
      setEnergy((prev) => Math.max(Math.floor(prev - decayRate), 0));
    }, 3000);
    return () => clearInterval(timer);
  }, [decayRate, gameOver]);

  // Subir de nivel
  useEffect(() => {
    const levelUpInterval = setInterval(() => {
      if (hunger > 20 && happiness > 20 && health > 20 && hygiene > 20 && energy > 20) {
        setLevelProgress((prev) => {
          if (prev >= 100) {
            setLevel((prev) => prev + 1);
            setDecayRate((prev) => prev + 0.5);
            return 0;
          }
          return prev + 1;
        });
      }
    }, 1000);
    return () => clearInterval(levelUpInterval);
  }, [hunger, happiness, health, hygiene, energy]);

  // Verificar estado crítico
  useEffect(() => {
    if (gameOver) return;
    if (hunger === 0 || happiness === 0 || health === 0 || hygiene === 0 || energy === 0) {
      setIsCritical(true);
      setGameOver(true);
    } else {
      setIsCritical(false);
    }
  }, [hunger, happiness, health, hygiene, energy, gameOver]);

  const feed = () => {
    if (gameOver) return;
    setHunger((prev) => Math.min(Math.floor(prev + 20), 100)); 
    setHealth((prev) => Math.min(Math.floor(prev + 5), 100));
    setEnergy((prev) => Math.max(Math.floor(prev - 5), 0));
  };

  const play = () => {
    if (gameOver) return;
    setHappiness((prev) => Math.min(Math.floor(prev + 20), 100)); 
    setHunger((prev) => Math.max(Math.floor(prev - 5), 0)); 
    setHealth((prev) => Math.max(Math.floor(prev - 5), 0)); 
    setEnergy((prev) => Math.max(Math.floor(prev - 10), 0)); 
  };

  const sleep = () => {
    if (gameOver) return;
    setHealth((prev) => Math.min(Math.floor(prev + 10), 100)); 
    setHappiness((prev) => Math.max(Math.floor(prev - 5), 0));
    setEnergy((prev) => Math.min(Math.floor(prev + 20), 100)); 
  };

  const clean = () => {
    if (gameOver) return;
    setHygiene((prev) => Math.min(Math.floor(prev + 20), 100)); 
    setEnergy((prev) => Math.max(Math.floor(prev - 5), 0)); 
  };

  const restartGame = () => {
    setHunger(50);
    setHappiness(50);
    setHealth(100);
    setHygiene(50);
    setEnergy(50);
    setLevel(1);
    setLevelProgress(0);
    setDecayRate(1);
    setCoins(0);
    setIsCritical(false);
    setGameOver(false);
    setBattleResult(""); 
  };

  
  const fight = () => {
    if (gameOver) return;

    
    const result = Math.random() < 0.5 ? "win" : "lose";

    if (result === "win") {
     
      const earnedCoins = Math.floor(Math.random() * (10000 - 3000 + 1)) + 3000;
      setCoins((prev) => prev + earnedCoins);
      setBattleResult(`¡Ganaste la pelea y recibiste ${earnedCoins} monedas! 🎉`);
    } else {
      
      setHealth((prev) => Math.max(prev - prev * 0.05, 0));
      setBattleResult("Perdiste la pelea. ¡Perdiste un 5% de salud! 😢");
    }
  };

  
  const buyItem = (item) => {
    if (coins < item.cost) {
      alert("¡No tienes suficientes monedas!");
      return;
    }

    setCoins((prev) => prev - item.cost);

    if (item.type === "hunger") {
      setHunger((prev) => Math.min(Math.floor(prev + 30), 100)); 
    } else if (item.type === "happiness") {
      setHappiness((prev) => Math.min(Math.floor(prev + 30), 100)); 
    } else if (item.type === "hygiene") {
      setHygiene((prev) => Math.min(Math.floor(prev + 30), 100)); 
    } else if (item.type === "energy") {
      setEnergy((prev) => Math.min(Math.floor(prev + 30), 100)); 
    }
  };

  
  const getProgressColor = (value) => {
    if (value >= 60) return "bg-green-500";
    if (value >= 30) return "bg-yellow-500";
    return "bg-red-500";
  };

  
  const getStatusMessage = () => {
    if (gameOver) return "¡Game Over! 😢";
    if (isCritical) return "¡Alerta! Necesitas cuidar de tu Tamagotchi urgentemente!";
    return "¡Todo está bien! 😊";
  };

  return (
    <div className="flex">
      <div className="w-2/3 p-4 bg-white">
      <div className="flex justify-center mb-4">
          <img
            src="/tumblr_f94d1715779ac36beb437479b1803c9c_5f569f71_1280.gif"
            alt="Cute animation"
            className="w-48 h-48"
          />
        </div>
        <h2 className="text-xl font-bold">Nivel {level}</h2>
        <div className="mt-4">
          <div className="flex items-center">
            <p className="font-semibold w-20">Hambre:</p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${getProgressColor(hunger)}`}
                style={{ width: `${hunger}%` }}
              ></div>
            </div>
            <p className="font-semibold">{Math.floor(hunger)}%</p>
          </div>
          <div className="flex items-center mt-2">
            <p className="font-semibold w-20">Felicidad:</p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${getProgressColor(happiness)}`}
                style={{ width: `${happiness}%` }}
              ></div>
            </div>
            <p className="font-semibold">{Math.floor(happiness)}%</p>
          </div>
          <div className="flex items-center mt-2">
            <p className="font-semibold w-20">Salud:</p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${getProgressColor(health)}`}
                style={{ width: `${health}%` }}
              ></div>
            </div>
            <p className="font-semibold">{Math.floor(health)}%</p>
          </div>
          <div className="flex items-center mt-2">
            <p className="font-semibold w-20">Higiene:</p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${getProgressColor(hygiene)}`}
                style={{ width: `${hygiene}%` }}
              ></div>
            </div>
            <p className="font-semibold">{Math.floor(hygiene)}%</p>
          </div>
          <div className="flex items-center mt-2">
            <p className="font-semibold w-20">Energía:</p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${getProgressColor(energy)}`}
                style={{ width: `${energy}%` }}
              ></div>
            </div>
            <p className="font-semibold">{Math.floor(energy)}%</p>
          </div>
        </div>
        <div className="mt-4">
          <button className="bg-blue-500 text-white p-2 rounded" onClick={feed}>Alimentar</button>
          <button className="bg-yellow-500 text-white p-2 rounded ml-2" onClick={play}>Jugar</button>
          <button className="bg-green-500 text-white p-2 rounded ml-2" onClick={sleep}>Descansar</button>
          <button className="bg-purple-500 text-white p-2 rounded ml-2" onClick={clean}>Limpiar</button>
          <button className="bg-red-500 text-white p-2 rounded ml-2" onClick={restartGame}>Reiniciar</button>
          <button className="bg-pink-500 text-white p-2 rounded ml-2" onClick={fight}>Pelear</button>
        </div>
        <div className="mt-4">
          <p>{getStatusMessage()}</p>
          {battleResult && <p>{battleResult}</p>} 
        </div>
      </div>

      {/* Tienda */}
      <div className="w-1/3 p-4 bg-gray-200 flex flex-col items-center justify-center rounded-lg shadow-xl">
        <h3 className="text-xl font-bold mb-4 text-center">Tienda</h3>
        <p className="font-semibold mb-4 text-center">Monedas: {coins}</p>
        
        <div className="space-y-4 w-full">
          <button
            onClick={() => buyItem({ type: "hunger", cost: 500 })}
            className="bg-green-500 text-white p-3 rounded-lg shadow-lg hover:bg-green-600 transition duration-200 w-full">Comida (500 monedas)</button>
          <button
            onClick={() => buyItem({ type: "happiness", cost: 500 })}
            className="bg-blue-500 text-white p-3 rounded-lg shadow-lg hover:bg-blue-600 transition duration-200 w-full">Juguete (500 monedas)</button>
          <button
            onClick={() => buyItem({ type: "hygiene", cost: 500 })}
            className="bg-purple-500 text-white p-3 rounded-lg shadow-lg hover:bg-purple-600 transition duration-200 w-full">Cepillo (500 monedas)</button>
          <button
            onClick={() => buyItem({ type: "energy", cost: 500 })}
            className="bg-yellow-500 text-white p-3 rounded-lg shadow-lg hover:bg-yellow-600 transition duration-200 w-full">Energizante (500 monedas)</button>
        </div>
      </div>
    </div>
  );
}