ALTER TABLE public.todos
ADD COLUMN priority INTEGER DEFAULT 1;

ALTER TABLE public.todos
ADD CONSTRAINT todos_priority_check
CHECK (priority IN (1, 2, 3));