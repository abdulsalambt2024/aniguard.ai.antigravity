import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Plus, Pencil, Trash2, Image, Calendar, ArrowUp, ArrowDown, Eye, EyeOff } from 'lucide-react';

interface Slideshow {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  is_active: boolean;
  display_order: number;
  start_date: string | null;
  end_date: string | null;
  created_by: string;
  created_at: string;
}

export default function SlideshowManager() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<Slideshow | null>(null);
  const [uploading, setUploading] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const { data: slideshows, isLoading } = useQuery({
    queryKey: ['admin-slideshows'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('slideshows')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data as Slideshow[];
    },
  });

  const createSlideshow = useMutation({
    mutationFn: async (data: { title: string; description: string | null; image_url: string; is_active: boolean; start_date: string | null; end_date: string | null }) => {
      const maxOrder = slideshows?.reduce((max, s) => Math.max(max, s.display_order || 0), 0) || 0;
      
      const { error } = await supabase
        .from('slideshows')
        .insert({
          title: data.title,
          description: data.description,
          image_url: data.image_url,
          is_active: data.is_active,
          start_date: data.start_date,
          end_date: data.end_date,
          created_by: user?.id!,
          display_order: maxOrder + 1,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-slideshows'] });
      toast.success('Slideshow created');
      resetForm();
      setDialogOpen(false);
    },
    onError: (error) => {
      toast.error('Failed to create slideshow');
      console.error(error);
    },
  });

  const updateSlideshow = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Slideshow> }) => {
      const { error } = await supabase
        .from('slideshows')
        .update(data)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-slideshows'] });
      toast.success('Slideshow updated');
      resetForm();
      setDialogOpen(false);
    },
    onError: (error) => {
      toast.error('Failed to update slideshow');
      console.error(error);
    },
  });

  const deleteSlideshow = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('slideshows')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-slideshows'] });
      toast.success('Slideshow deleted');
    },
    onError: (error) => {
      toast.error('Failed to delete slideshow');
      console.error(error);
    },
  });

  const updateOrder = useMutation({
    mutationFn: async ({ id, newOrder }: { id: string; newOrder: number }) => {
      const { error } = await supabase
        .from('slideshows')
        .update({ display_order: newOrder })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-slideshows'] });
    },
  });

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setImageUrl('');
    setIsActive(true);
    setStartDate('');
    setEndDate('');
    setEditingSlide(null);
  };

  const openEditDialog = (slide: Slideshow) => {
    setEditingSlide(slide);
    setTitle(slide.title);
    setDescription(slide.description || '');
    setImageUrl(slide.image_url);
    setIsActive(slide.is_active);
    setStartDate(slide.start_date ? format(new Date(slide.start_date), 'yyyy-MM-dd') : '');
    setEndDate(slide.end_date ? format(new Date(slide.end_date), 'yyyy-MM-dd') : '');
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!title || !imageUrl) {
      toast.error('Title and image are required');
      return;
    }

    const data = {
      title,
      description: description || null,
      image_url: imageUrl,
      is_active: isActive,
      start_date: startDate || null,
      end_date: endDate || null,
    };

    if (editingSlide) {
      updateSlideshow.mutate({ id: editingSlide.id, data });
    } else {
      createSlideshow.mutate(data);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `slideshows/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('event-banners')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('event-banners')
        .getPublicUrl(filePath);

      setImageUrl(publicUrl);
      toast.success('Image uploaded');
    } catch (error) {
      toast.error('Failed to upload image');
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const moveSlide = (index: number, direction: 'up' | 'down') => {
    if (!slideshows) return;
    
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= slideshows.length) return;

    const currentSlide = slideshows[index];
    const targetSlide = slideshows[targetIndex];

    updateOrder.mutate({ id: currentSlide.id, newOrder: targetSlide.display_order });
    updateOrder.mutate({ id: targetSlide.id, newOrder: currentSlide.display_order });
  };

  return (
    <div className="container max-w-7xl mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Slideshow Manager</h1>
          <p className="text-muted-foreground">Manage homepage slideshow images</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Slide
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingSlide ? 'Edit Slide' : 'Add New Slide'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Title *</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Slide title"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional description"
                  rows={3}
                />
              </div>
              <div>
                <Label>Image *</Label>
                <div className="flex gap-2">
                  <Input
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="Image URL"
                    className="flex-1"
                  />
                  <Button variant="outline" asChild disabled={uploading}>
                    <label className="cursor-pointer">
                      <Image className="h-4 w-4" />
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </label>
                  </Button>
                </div>
                {imageUrl && (
                  <img src={imageUrl} alt="Preview" className="mt-2 rounded-lg max-h-40 object-cover" />
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={isActive}
                  onCheckedChange={setIsActive}
                />
                <Label>Active</Label>
              </div>
              <Button onClick={handleSubmit} className="w-full" disabled={uploading}>
                {editingSlide ? 'Update Slide' : 'Create Slide'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Loading...</div>
      ) : slideshows?.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Image className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No slideshows yet. Add your first slide!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {slideshows?.map((slide, index) => (
            <Card key={slide.id} className={!slide.is_active ? 'opacity-60' : ''}>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <img
                    src={slide.image_url}
                    alt={slide.title}
                    className="w-40 h-24 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold flex items-center gap-2">
                          {slide.title}
                          {slide.is_active ? (
                            <Eye className="h-4 w-4 text-emerald-500" />
                          ) : (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          )}
                        </h3>
                        {slide.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">{slide.description}</p>
                        )}
                        <div className="flex gap-2 mt-2 text-xs text-muted-foreground">
                          {slide.start_date && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              From: {format(new Date(slide.start_date), 'MMM d, yyyy')}
                            </span>
                          )}
                          {slide.end_date && (
                            <span className="flex items-center gap-1">
                              To: {format(new Date(slide.end_date), 'MMM d, yyyy')}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => moveSlide(index, 'up')}
                          disabled={index === 0}
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => moveSlide(index, 'down')}
                          disabled={index === slideshows.length - 1}
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(slide)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => deleteSlideshow.mutate(slide.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
