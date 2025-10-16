import type { Action, Queue, User } from "../../module_bindings";
import PlayerView from "./PlayerView";

type MobileInputProps = {
  player: User | undefined;
  players: User[];
  actions: Action[];
  queue: Queue[];

  setPlayers: (players: User[]) => void;
  onNameChanged: (name: string) => void;
  onSpinClicked?: () => void;
  onAddAction?: (action: string) => void;
  onRemoveAction: (action: Action) => void;
};

export default function MobileInput({ ...props }: MobileInputProps) {
  return <PlayerView setPlayerName={props.onNameChanged} {...props} />;
}
