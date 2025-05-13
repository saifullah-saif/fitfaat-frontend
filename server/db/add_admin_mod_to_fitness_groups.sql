-- Add admin_mod column to fitness_groups table
ALTER TABLE fitness_groups ADD COLUMN admin_mod ENUM('Active', 'Inactive') DEFAULT 'Active';

-- Update existing groups to have 'Active' status
UPDATE fitness_groups SET admin_mod = 'Active';
