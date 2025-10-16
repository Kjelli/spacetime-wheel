namespace SpacetimeWheel;

using SpacetimeDB;

public static partial class Module
{
	[Table(Name = "Actions", Public = true)]
	public partial class Action
	{
		public Identity Sender;
		public string Text = "";
	}


	[Reducer]
	public static void AddAction(ReducerContext ctx, string text)
	{
		text = ValidateActionText(text);
		Log.Info(text);
		ctx.Db.Actions.Insert(
			new Action
			{
				Sender = ctx.Sender,
				Text = text,
			}
		);
	}

	[Reducer]
	public static void RemoveAction(ReducerContext ctx, Action action)
	{
		ctx.Db.Actions.Delete(action);
	}

	/// Takes a message's text and checks if it's acceptable to send.
	private static string ValidateActionText(string text)
	{
		if (string.IsNullOrEmpty(text))
		{
			throw new ArgumentException("Messages must not be empty");
		}
		return text;
	}
}
