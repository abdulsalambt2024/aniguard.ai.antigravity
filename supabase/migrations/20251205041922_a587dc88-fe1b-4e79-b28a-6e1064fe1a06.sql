-- Create storage bucket for chat media if not exists
INSERT INTO storage.buckets (id, name, public) 
VALUES ('chat-media', 'chat-media', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for chat media
CREATE POLICY "Authenticated users can upload chat media" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'chat-media' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Anyone can view chat media" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'chat-media');

CREATE POLICY "Users can delete their own chat media" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'chat-media' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);