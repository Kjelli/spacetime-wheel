import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SpinWheel from "./Wheel";
import CountdownCircle from "./CountdownCircle";
import type { Action, Queue, User } from "../module_bindings";
import QRCode from "./QrCode";

type DesktopScreenProps = {
  players: User[];
  actions: Action[];
  queue: Queue[];

  removeFromQueue: (queue: Queue) => void;
};

enum SpinState {
  Player = "player",
  Action = "action",
  Complete = "complete",
}

export default function DesktopScreen({
  players = [],
  actions = [],
  queue = [],
  removeFromQueue,
}: DesktopScreenProps) {
  const [selectedPlayer, setSelectedPlayer] = useState<User | undefined>();
  const [selectedAction, setSelectedAction] = useState<string>("g2");
  const [spinState, setSpinState] = useState(SpinState.Player);
  const [autoSpin, setAutoSpin] = useState(false);

  const setResultPlayer = (user: User) => {
    setSelectedPlayer(user);
    setSpinState(SpinState.Action);
  };

  const setResultAction = (action: string) => {
    setSelectedAction(action);
    setSpinState(SpinState.Complete);
  };

  const reset = () => {
    removeFromQueue(queue[0]);
    setSelectedAction("");
    setSelectedPlayer(undefined);
    setSpinState(SpinState.Player);
  };

  const variants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -20, scale: 0.95 },
  };

  const countdownVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 },
  };

  useEffect(() => {
    setAutoSpin(queue.length > 0);
  }, [queue, autoSpin]);

  return (
    <div className="flex h-screen w-screen bg-gradient-to-br from-black to-purple-900 justify-center items-center overflow-hidden relative">
      <AnimatePresence mode="wait">
        {spinState === SpinState.Player && (
          <motion.div
            key="player-wheel"
            className="h-3/4 w-3/4 flex justify-center items-center"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={variants}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            <SpinWheel
              autoSpin={autoSpin}
              slices={players.map((p) => {
                return { key: p.identity.toHexString(), text: p.name! };
              })}
              onSpinComplete={(slice) =>
                setResultPlayer(
                  players.find((p) => p.identity.toHexString() === slice.key)!
                )
              }
            />
          </motion.div>
        )}

        {spinState === SpinState.Action && (
          <motion.div
            key="action-wheel"
            className="h-3/4 w-full flex justify-center items-center"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={variants}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            <SpinWheel
              slices={actions.map((action) => {
                return { key: action.text, text: action.text };
              })}
              onSpinComplete={(slice) => setResultAction(slice.text)}
              autoSpin
            />
          </motion.div>
        )}

        {spinState === SpinState.Complete && (
          <motion.div
            key="complete"
            className="flex flex-col justify-center items-center relative space-y-8"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={variants}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            {/* Titles */}
            <div className="complete-style text-center space-y-4 relative -top-10">
              <h1 className="text-3xl text-white">{selectedPlayer?.name}</h1>
              <h1 className="text-8xl text-white my-anim">{selectedAction}!</h1>
            </div>

            {/* Countdown Circle */}
            <motion.div
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={countdownVariants}
              transition={{ delay: 0.5, duration: 0.5, ease: "easeOut" }}
            >
              <CountdownCircle
                duration={15}
                size={120}
                color="#f87171"
                onComplete={reset}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="absolute top-20 left-20">
        <QRCode
          value={`http://${import.meta.env.VITE_SPACETIME_MODULE_HOST}:${import.meta.env.VITE_WEB_PORT}`}
          size={200}
        />
      </div>

      <div className="absolute bottom-20 left-20">
        <p className="text-3xl text-white">Kø</p>
        <div className="text-2xl text-white">
          {queue.length === 0 && <p className="text-gray-500">Ingen</p>}
          {queue.length > 0 &&
            queue.map((q, i) => (
              <div key={q.user?.name}>
                {i == 0 ? (
                  <p className="-left-8 relative">👉{q.user?.name}</p>
                ) : (
                  <p>{q.user?.name}</p>
                )}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
