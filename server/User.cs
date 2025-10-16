namespace SpacetimeWheel;

using SpacetimeDB;

public static partial class Module
{
	[Table(Name = "Users", Public = true)]
	public partial class User
	{
		[PrimaryKey]
		public Identity Identity;
		public string? Name;
		public bool IsVIP = false;
	}

	[Reducer]
	public static void AddUser(ReducerContext ctx, string name, int age)
	{
		var person = ctx.Db.Users.Insert(new User { Name = name });
		Log.Info($"Inserted {person.Name} under #{person.Identity}");
	}

	[Reducer]
	public static void UpdateUserName(ReducerContext ctx, string name)
	{
		name = ValidateUserName(name);

		if (ctx.Db.Users.Identity.Find(ctx.Sender) is User user)
		{
			user.Name = name;
			ctx.Db.Users.Identity.Update(user);
		}
	}

	/// Takes a name and checks if it's acceptable as a user's name.
	private static string ValidateUserName(string name)
	{
		if (string.IsNullOrEmpty(name))
		{
			throw new Exception("Names must not be empty");
		}
		return name;
	}

}
