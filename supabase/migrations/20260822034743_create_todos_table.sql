-- TODOテーブルを作成
CREATE TABLE public.todos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- RLSを有効化
ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;

-- 自分のTODOだけ参照できる
CREATE POLICY "Users can view own todos"
ON public.todos
FOR SELECT
USING (auth.uid() = user_id);

-- 自分のTODOだけ追加できる
CREATE POLICY "Users can insert own todos"
ON public.todos
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 自分のTODOだけ更新できる
CREATE POLICY "Users can update own todos"
ON public.todos
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 自分のTODOだけ削除できる
CREATE POLICY "Users can delete own todos"
ON public.todos
FOR DELETE
USING (auth.uid() = user_id);