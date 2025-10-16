namespace SpacetimeWheel;

using SpacetimeDB;

public static partial class Module
{
	[Table(Name = "Queue", Public = true)]
	public partial class Queue
	{
		[PrimaryKey]
		public Identity UserIdentity;

		public User? User;
	}


	[Reducer]
	public static void AddUserToQueue(ReducerContext ctx, Identity userIdentity)
	{
		if (ctx.Db.Users.Identity.Find(userIdentity) is not User user)
		{
			return;
		}

		if (ctx.Db.Queue.UserIdentity.Find(userIdentity) is not null)
		{
			return;
		}

		ctx.Db.Queue.Insert(new Queue
		{
			UserIdentity = userIdentity,
			User = user,
		});
	}

	[Reducer]
	public static void RemoveUserFromQueue(ReducerContext ctx, Identity userIdentity)
	{
		if (ctx.Db.Users.Identity.Find(userIdentity) is not User)
		{
			return;
		}

		if (ctx.Db.Queue.UserIdentity.Find(userIdentity) is not Queue queue)
		{
			return;
		}

		ctx.Db.Queue.Delete(queue);
	}
}