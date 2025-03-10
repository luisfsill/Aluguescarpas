import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// MySQL connection configuration
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'real_estate',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Create property
app.post('/api/properties', upload.array('images'), async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      location,
      type,
      bedrooms,
      bathrooms,
      area,
      isFeatured
    } = req.body;

    const images = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      const [result] = await connection.execute(
        `INSERT INTO properties (
          title, description, price, location, type, 
          bedrooms, bathrooms, area, isFeatured
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [title, description, price, location, type, bedrooms, bathrooms, area, isFeatured]
      );

      const propertyId = result.insertId;

      // Insert images
      if (images.length > 0) {
        const imageValues = images.map(url => [propertyId, url]);
        await connection.query(
          'INSERT INTO property_images (property_id, image_url) VALUES ?',
          [imageValues]
        );
      }

      await connection.commit();
      res.status(201).json({ id: propertyId, message: 'Property created successfully' });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error creating property:', error);
    res.status(500).json({ error: 'Failed to create property' });
  }
});

// Get all properties
app.get('/api/properties', async (req, res) => {
  try {
    const [properties] = await pool.execute(`
      SELECT p.*, GROUP_CONCAT(pi.image_url) as images
      FROM properties p
      LEFT JOIN property_images pi ON p.id = pi.property_id
      GROUP BY p.id
    `);

    const formattedProperties = properties.map(property => ({
      ...property,
      images: property.images ? property.images.split(',') : [],
      isFeatured: Boolean(property.isFeatured)
    }));

    res.json(formattedProperties);
  } catch (error) {
    console.error('Error fetching properties:', error);
    res.status(500).json({ error: 'Failed to fetch properties' });
  }
});

// Get single property
app.get('/api/properties/:id', async (req, res) => {
  try {
    const [properties] = await pool.execute(`
      SELECT p.*, GROUP_CONCAT(pi.image_url) as images
      FROM properties p
      LEFT JOIN property_images pi ON p.id = pi.property_id
      WHERE p.id = ?
      GROUP BY p.id
    `, [req.params.id]);

    if (properties.length === 0) {
      return res.status(404).json({ error: 'Property not found' });
    }

    const property = {
      ...properties[0],
      images: properties[0].images ? properties[0].images.split(',') : [],
      isFeatured: Boolean(properties[0].isFeatured)
    };

    res.json(property);
  } catch (error) {
    console.error('Error fetching property:', error);
    res.status(500).json({ error: 'Failed to fetch property' });
  }
});

// Update property
app.put('/api/properties/:id', upload.array('images'), async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      location,
      type,
      bedrooms,
      bathrooms,
      area,
      isFeatured
    } = req.body;

    const newImages = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      await connection.execute(
        `UPDATE properties SET
          title = ?, description = ?, price = ?, location = ?, 
          type = ?, bedrooms = ?, bathrooms = ?, area = ?, 
          isFeatured = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?`,
        [title, description, price, location, type, bedrooms, bathrooms, area, isFeatured, req.params.id]
      );

      // Add new images if any
      if (newImages.length > 0) {
        const imageValues = newImages.map(url => [req.params.id, url]);
        await connection.query(
          'INSERT INTO property_images (property_id, image_url) VALUES ?',
          [imageValues]
        );
      }

      await connection.commit();
      res.json({ message: 'Property updated successfully' });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error updating property:', error);
    res.status(500).json({ error: 'Failed to update property' });
  }
});

// Delete property
app.delete('/api/properties/:id', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      // Delete images first (foreign key constraint)
      await connection.execute(
        'DELETE FROM property_images WHERE property_id = ?',
        [req.params.id]
      );

      // Then delete the property
      await connection.execute(
        'DELETE FROM properties WHERE id = ?',
        [req.params.id]
      );

      await connection.commit();
      res.json({ message: 'Property deleted successfully' });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error deleting property:', error);
    res.status(500).json({ error: 'Failed to delete property' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});