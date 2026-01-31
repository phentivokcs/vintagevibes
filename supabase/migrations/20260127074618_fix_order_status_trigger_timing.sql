/*
  # Fix Order Status Trigger Timing
  
  ## Problem
  The BEFORE INSERT trigger tries to insert into order_status_history before the order exists,
  causing a foreign key constraint violation.
  
  ## Solution
  Change the trigger to AFTER INSERT/UPDATE so the order already exists in the database
  when we try to log the status change.
  
  ## Changes
  - Modify trigger to run AFTER instead of BEFORE
  - Update the function to not modify NEW (since AFTER triggers can't modify the row)
  - Add a separate UPDATE to set status_updated_at
*/

-- Drop the existing trigger
DROP TRIGGER IF EXISTS order_status_change_trigger ON orders;

-- Recreate the function for AFTER trigger (can't modify NEW)
CREATE OR REPLACE FUNCTION log_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log if status actually changed or it's a new insert
  IF (TG_OP = 'INSERT') OR (OLD.status IS DISTINCT FROM NEW.status) THEN
    INSERT INTO order_status_history (order_id, old_status, new_status, changed_by, notes)
    VALUES (
      NEW.id,
      CASE WHEN TG_OP = 'INSERT' THEN NULL ELSE OLD.status END,
      NEW.status,
      auth.uid(),
      NEW.notes
    );
    
    -- Update status_updated_at timestamp (only on UPDATE, INSERT will use default)
    IF TG_OP = 'UPDATE' THEN
      UPDATE orders SET status_updated_at = now() WHERE id = NEW.id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to run AFTER insert/update
CREATE TRIGGER order_status_change_trigger
  AFTER INSERT OR UPDATE OF status ON orders
  FOR EACH ROW
  EXECUTE FUNCTION log_order_status_change();
