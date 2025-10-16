import { useEffect, useRef, useState } from "react";
import type { Action, Queue, User } from "../../module_bindings";

type PlayerViewProps = {
  player?: User;
  actions: Action[];
  queue: Queue[];

  onSpinClicked?: () => void;
  setPlayerName?: (name: string) => void;

  onAddAction?: (action: string) => void;
  onRemoveAction?: (action: Action) => void;
};

export default function PlayerView({
  player,
  actions,
  queue,

  onSpinClicked,
  setPlayerName,
  onAddAction,
  onRemoveAction,
}: PlayerViewProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [localName, setLocalName] = useState(player?.name);
  const [newAction, setNewAction] = useState("");

  const [isChangingName, setIsChangingName] = useState(false);
  const [isEditingActions, setIsEditingActions] = useState(false);
  const [queuePosition, setQueuePosition] = useState(-1);

  useEffect(() => {
    setQueuePosition(
      !player?.identity
        ? -1
        : queue.findIndex((q) => q.userIdentity.isEqual(player.identity))
    );
  }, [player, queue]);

  const selectInput = () => {
    if (inputRef.current) {
      inputRef.current.select();
    }
  };

  useEffect(() => {
    if (player?.name) {
      setLocalName(player?.name);
    }
  }, [player]);

  // If player has no name yet, show input to set it
  if (!localName || isChangingName) {
    return (
      <div className="p-4 min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-black to-purple-900 gap-6 overflow-auto">
        <h1 className="text-3xl font-extrabold text-white mb-4 drop-shadow-lg">
          Skriv inn navn
        </h1>

        <form
          className="w-full max-w-sm flex flex-col gap-8"
          onSubmit={(e) => {
            e.preventDefault();
            if (localName?.trim() && setPlayerName) {
              setIsChangingName(false);
              setPlayerName(localName.trim());
            }
          }}
        >
          <input
            ref={inputRef}
            type="text"
            placeholder="Navn"
            value={localName}
            onChange={(e) => setLocalName(e.target.value)}
            maxLength={16}
            onFocus={(e) => {
              inputRef.current?.select();
              e.target.scrollIntoView({ behavior: "smooth" });
            }}
            className="text-3xl text-white h-16 w-full p-2 rounded-md border border-gray-700 bg-gray-900 placeholder-gray-600"
          />
          <button
            type="submit"
            className="text-3xl text-white h-16 w-full bg-purple-900 font-bold py-3 rounded-xl"
          >
            Lagre
          </button>
        </form>
      </div>
    );
  }

  // VIP -> Admin editing
  if (isEditingActions) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-black to-purple-900 gap-12 overflow-hidden">
        <h1 className="text-3xl font-extrabold text-white mb-4 drop-shadow-lg">
          Legg til aksjon
        </h1>

        <form
          className="w-full max-w-sm flex flex-col gap-8"
          onSubmit={(e) => {
            e.preventDefault();
            if (newAction?.trim() && onAddAction) {
              onAddAction(newAction.trim());
              setNewAction("");
            }
          }}
        >
          <input
            ref={inputRef}
            type="text"
            placeholder="Navn"
            value={newAction}
            onChange={(e) => setNewAction(e.target.value)}
            maxLength={32}
            onFocus={(e) => {
              inputRef.current?.select();
              e.target.scrollIntoView({ behavior: "smooth" });
            }}
            className="text-3xl text-white h-16 w-full p-2 rounded-md border border-gray-700 bg-gray-900 placeholder-gray-600"
          />
          <button
            type="submit"
            className="text-3xl text-white h-16 w-full bg-purple-900 font-bold py-3 rounded-xl"
          >
            Legg til
          </button>
        </form>

        <ul className="w-2/3 self-center space-y-8">
          {actions.map((a, i) => (
            <li key={i} className="flex justify-between">
              <p className="text-3xl text-white text-center truncate wrap-anywhere whitespace-pre-wrap">
                {a.text}
              </p>{" "}
              <button
                className="text-3xl bg-red-400 rounded-2xl float-right"
                onClick={() => onRemoveAction?.(a)}
              >
                &nbsp;X&nbsp;
              </button>
            </li>
          ))}
        </ul>

        <button
          className="text-3xl text-white h-16 w-full max-w-sm bg-red-950  font-bold py-3 rounded-xl"
          onClick={() => {
            setIsEditingActions(false);
          }}
        >
          Tilbake
        </button>
      </div>
    );
  }

  // Otherwise, show Spin button
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-black to-purple-900 gap-12 overflow-hidden">
      <h1 className="text-4xl text-white outfit-500 font-extrabold drop-shadow-lg text-center">
        {localName}
      </h1>
      {queuePosition === -1 && (
        <>
          <button
            className="text-3xl text-white h-16 w-full max-w-sm bg-purple-950  font-bold py-3 rounded-xl"
            onClick={() => {
              setIsChangingName(true);
              selectInput();
            }}
          >
            Bytt navn
          </button>

          {player?.isVip && (
            <div className="flex w-full justify-center items-center">
              <button
                className="text-3xl text-white h-16 w-full max-w-sm bg-red-950  font-bold py-3 rounded-xl"
                onClick={() => {
                  setIsEditingActions(true);
                }}
              >
                Rediger aksjoner
              </button>
            </div>
          )}

          <button
            onClick={onSpinClicked}
            className="text-3xl text-white h-64 w-full max-w-sm bg-orange-600 font-bold py-3 rounded-xl"
          >
            Spinn!
          </button>
        </>
      )}

      {queuePosition === 0 && (
        <p className="text-3xl text-white h-64 w-full max-w-sm text-center">
          Du spinner nå, følg med på skjermen!
        </p>
      )}

      {queuePosition > 0 && (
        <p className="text-3xl text-white h-64 w-full max-w-sm text-center">
          Du er nummer {" " + queuePosition} i køen!
        </p>
      )}
    </div>
  );
}
