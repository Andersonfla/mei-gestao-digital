-- Ensure last_message_at stays updated when new messages arrive
DO $$ BEGIN
  -- Create trigger only if it does not exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_update_conversation_timestamp'
  ) THEN
    CREATE TRIGGER trg_update_conversation_timestamp
    AFTER INSERT ON public.support_messages
    FOR EACH ROW
    EXECUTE FUNCTION public.update_conversation_timestamp();
  END IF;
END $$;