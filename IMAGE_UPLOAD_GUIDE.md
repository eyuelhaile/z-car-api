# Image Upload Guide for Frontend

## Correct Upload Endpoints

### Upload Multiple Images (for listings)
```
POST /api/v1/uploads/images
Content-Type: multipart/form-data
Authorization: Bearer <token>
```

**Form Data:**
- `images`: File[] (multiple files, max 20)
- `folder`: string (optional, default: "listings")

**Example using fetch:**
```javascript
const formData = new FormData();
formData.append('images', file1);
formData.append('images', file2);
formData.append('images', file3);
formData.append('folder', 'listings'); // optional

const response = await fetch('http://localhost:3001/api/v1/uploads/images', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});

const result = await response.json();
// result.data is an array of image objects
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "original": "/uploads/images/original/listings/b123756a-71f6-4c67-9d4e-554d7adaf22c.jpg",
      "thumbnail": "/uploads/images/thumbnail/listings/b123756a-71f6-4c67-9d4e-554d7adaf22c.jpg",
      "small": "/uploads/images/small/listings/b123756a-71f6-4c67-9d4e-554d7adaf22c.jpg",
      "medium": "/uploads/images/medium/listings/b123756a-71f6-4c67-9d4e-554d7adaf22c.jpg",
      "large": "/uploads/images/large/listings/b123756a-71f6-4c67-9d4e-554d7adaf22c.jpg",
      "webp": "/uploads/images/webp/listings/b123756a-71f6-4c67-9d4e-554d7adaf22c.webp",
      "blurhash": "...",
      "metadata": { ... }
    }
  ]
}
```

---

### Upload Single Image
```
POST /api/v1/uploads/image
Content-Type: multipart/form-data
Authorization: Bearer <token>
```

**Form Data:**
- `image`: File (single file)
- `folder`: string (optional, default: "listings")
- `watermark`: string (optional)

**Example:**
```javascript
const formData = new FormData();
formData.append('image', file);
formData.append('folder', 'listings');

const response = await fetch('http://localhost:3001/api/v1/uploads/image', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

---

## Complete Workflow: Create Listing with Images

### Step 1: Upload Images First
```javascript
// Upload images
const formData = new FormData();
files.forEach(file => {
  formData.append('images', file);
});

const uploadResponse = await fetch('http://localhost:3001/api/v1/uploads/images', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});

const uploadResult = await uploadResponse.json();
const imageUrls = uploadResult.data.map(img => img.original);
// imageUrls = ["/uploads/images/original/listings/xxx.jpg", ...]
```

### Step 2: Create Listing with Image URLs
```javascript
const listingData = {
  type: "vehicle",
  title: "Suzuki Dzire 2022",
  description: "...",
  price: 2500000,
  currency: "ETB",
  negotiable: true,
  city: "addis-ababa",
  address: "Bole",
  contactPhone: "+251917204797",
  images: imageUrls, // Use URLs from upload response
  vehicleAttributes: {
    make: "suzuki",
    model: "Dzire",
    year: 2022,
    // ... other attributes
  }
};

const createResponse = await fetch('http://localhost:3001/api/v1/listings', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(listingData)
});
```

---

## Accessing Uploaded Images

After upload, images are accessible at:

### Full URL Format:
```
http://localhost:3001/uploads/images/original/listings/{fileId}.jpg
http://localhost:3001/uploads/images/thumbnail/listings/{fileId}.jpg
http://localhost:3001/uploads/images/small/listings/{fileId}.jpg
http://localhost:3001/uploads/images/medium/listings/{fileId}.jpg
http://localhost:3001/uploads/images/large/listings/{fileId}.jpg
http://localhost:3001/uploads/images/webp/listings/{fileId}.webp
```

### Or via API (if needed):
```
GET /api/v1/uploads/images/{fileId}
GET /api/v1/uploads/images/{size}/{fileId}
GET /api/v1/uploads/images/{folder}/{size}/{fileId}
```

---

## Important Notes

1. **Upload FIRST, then create listing** - Images must be uploaded before creating the listing
2. **Use the `original` URL** from upload response in the listing `images` array
3. **File field name must be `images`** (plural) for multiple uploads
4. **File field name must be `image`** (singular) for single upload
5. **Max 20 images** per upload request
6. **Max 10MB** per image
7. **Supported formats**: JPEG, PNG, WebP, GIF

---

## Example: React Component

```jsx
const ListingForm = () => {
  const [images, setImages] = useState([]);
  const [imageUrls, setImageUrls] = useState([]);

  const handleImageUpload = async (files) => {
    const formData = new FormData();
    Array.from(files).forEach(file => {
      formData.append('images', file);
    });

    const response = await fetch('/api/v1/uploads/images', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    const result = await response.json();
    const urls = result.data.map(img => img.original);
    setImageUrls(urls);
  };

  const handleSubmit = async (listingData) => {
    const response = await fetch('/api/v1/listings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        ...listingData,
        images: imageUrls // Use uploaded image URLs
      })
    });
  };

  return (
    <form>
      <input 
        type="file" 
        multiple 
        accept="image/*"
        onChange={(e) => handleImageUpload(e.target.files)}
      />
      {/* ... rest of form */}
    </form>
  );
};
```

