import { useState, useEffect } from "react";
import DesktopWheel from "./components/DesktopScreen";
import MobileScreen from "./components/mobile/MobileScreen";
import { Action, DbConnection, Queue, User } from "./module_bindings";
import { useSpacetimeDB, useTable } from "spacetimedb/react";

export default function MainScreen() {
  const [players, setPlayers] = useState<User[]>([]);
  const [actions, setActions] = useState<Action[]>([]);
  const [queue, setQueue] = useState<Queue[]>([]);

  const conn = useSpacetimeDB<DbConnection>();

  const { identity, isActive: connected } = conn;

  useEffect(() => {
    if (!connected) return;
    const subs = [
      conn.subscriptionBuilder().subscribe("SELECT * FROM Actions"),
      conn.subscriptionBuilder().subscribe("SELECT * FROM Users"),
      conn.subscriptionBuilder().subscribe("SELECT * FROM Queue"),
    ];
    return () => subs.forEach((s) => s.unsubscribe());
  }, [conn, connected]);

  const { rows: actionsFromDb } = useTable<DbConnection, Action>("actions", {
    onInsert: (action) => {
      setActions([...actions, action]);
    },
    onDelete: (action) => {
      setActions(actions.filter((a) => a.text !== action.text));
    },
  });

  const { rows: users } = useTable<DbConnection, User>("users", {
    onInsert: (user) => {
      // Don't add if already existing somehow
      if (players.find((f) => f.identity.isEqual(user.identity))) {
        return;
      }

      setPlayers([
        ...players,
        { identity: user.identity, name: user.name, isVip: user.isVip },
      ]);
    },
    onUpdate: (oldRow: User, newRow: User) => {
      setPlayers([
        ...players.filter((u) => !u.identity.isEqual(oldRow.identity)),
        { identity: newRow.identity, name: newRow.name, isVip: newRow.isVip },
      ]);
    },
    onDelete: (user) => {
      setPlayers(players.filter((u) => !u.identity.isEqual(user.identity)));
    },
  });

  const { rows: queuedUsers } = useTable<DbConnection, Queue>("queue", {
    onInsert: (queuedUser) => {
      setQueue([...queue, queuedUser]);
    },
    onDelete: (queuedUser) => {
      setQueue(
        queue.filter((q) => !q.userIdentity.isEqual(queuedUser.userIdentity))
      );
    },
  });

  useEffect(() => {
    setPlayers(
      [...users.filter((user) => !!user.name)].sort(() => Math.random() - 0.5)
    );
  }, [users]);

  useEffect(() => {
    setQueue([...queuedUsers]);
  }, [queuedUsers]);

  useEffect(() => {
    setActions([...actionsFromDb]);
  }, [actionsFromDb]);

  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const onSpinClicked = (): void => {
    if (!identity) return;

    conn.reducers.addUserToQueue(identity);
  };

  function removeFromQueue(queue: Queue): void {
    if (!queue?.userIdentity) return;
    conn.reducers.removeUserFromQueue(queue.userIdentity);
  }

  const onNameChanged = (name: string): void => {
    conn.reducers.updateUserName(name);
  };

  function onAddAction(action: string): void {
    conn.reducers.addAction(action);
  }

  function onRemoveAction(action: Action): void {
    conn.reducers.removeAction(action);
  }

  if (!connected) {
    return <p>loading</p>;
  }

  const player = (() => {
    if (!identity) return;

    const user = users.find((u) => u.identity.isEqual(identity));
    return user;
  })();

  return isDesktop ? (
    <DesktopWheel
      players={players}
      actions={actions}
      queue={queue}
      removeFromQueue={removeFromQueue}
    />
  ) : (
    <MobileScreen
      player={player}
      players={players}
      actions={actions}
      queue={queue}
      setPlayers={setPlayers}
      onNameChanged={onNameChanged}
      onSpinClicked={onSpinClicked}
      onAddAction={onAddAction}
      onRemoveAction={onRemoveAction}
    />
  );
}
