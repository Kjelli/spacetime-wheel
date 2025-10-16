namespace SpacetimeWheel;

using SpacetimeDB;

public static partial class Module
{
	[Reducer(ReducerKind.ClientConnected)]
	public static void ClientConnected(ReducerContext ctx)
	{
		Log.Info($"Connect {ctx.Sender}");

		if (ctx.Db.Users.Identity.Find(ctx.Sender) is User user)
		{
			ctx.Db.Users.Identity.Update(user);
		}
		else
		{
			// If this is a new user, create a `User` object for the `Identity`,
			// which is online, but hasn't set a name.
			ctx.Db.Users.Insert(
				new User
				{
					Name = null,
					Identity = ctx.Sender,
				}
			);
		}
	}

	[Reducer(ReducerKind.ClientDisconnected)]
	public static void ClientDisconnected(ReducerContext ctx)
	{
		// Do nothing as of now
		//if (ctx.Db.Users.Identity.Find(ctx.Sender) is User user)
		//{
		//	// This user should exist, so set `Online: false`.
		//	user.Online = false;
		//	ctx.Db.Users.Identity.Update(user);
		//}
		//else
		//{
		//	// User does not exist, log warning
		//	Log.Warn("Warning: No user found for disconnected client.");
		//}
	}
}
