import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { PDFDocument } from 'pdf-lib';
import session from 'express-session';
import mongoose from 'mongoose';
import multer from 'multer';
import { GridFsStorage } from 'multer-gridfs-storage';
import crypto from 'crypto';
import Grid from 'gridfs-stream';
import bodyParser from 'body-parser';
import { validateWebhookSignature } from 'razorpay/dist/utils/razorpay-utils.js';
import MongoStore from 'connect-mongo';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

//middlewares
// Middleware for parsing form data and JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Connect to MongoDB
mongoose
    .connect('mongodb://localhost:27017/xerostation') // No options required
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('MongoDB connection error:', err));
    
    const conn = mongoose.connection;


// GridFS setup

let gfs;
conn.once('open', () => {
    gfs = new mongoose.mongo.GridFSBucket(conn.db, {
        bucketName: 'uploads',
    });

    // Check if GridFSBucket is initialized correctly
    if (!gfs) {
        console.error('GridFS Bucket not initialized!');
    }
});


// Define storage for GridFS
const storage = new GridFsStorage({
    url: 'mongodb://localhost:27017/xerostation',
    file: async (req, file) => {
        return new Promise((resolve, reject) => {
            crypto.randomBytes(16, (err, buf) => {
                if (err) return reject(err);
                const filename = `${buf.toString('hex')}-${file.originalname}`;
                const fileInfo = {
                    filename,
                    bucketName: 'uploads',
                };
                resolve(fileInfo);
            });
        });
    },
});

const upload = multer({ storage });

app.post('/upload', upload.single('file'), async (req, res) => {
    // req.file will have the file information
    if (req.file) {
        console.log("File uploaded successfully:", req.file);
        res.status(200).send('File uploaded successfully');
    } else {
        res.status(400).send('No file uploaded');
    }
});

// test

app.post('/upload2', upload.single('file'), async (req, res) => {
    // req.file will have the file information
    if (req.file) {
        console.log("File uploaded successfully:", req.file);
        res.status(200).send('File uploaded successfully');
    } else {
        res.status(400).send('No file uploaded');
    }
});



// Define the User schema and model
const userSchema = new mongoose.Schema({
    roll_number: { type: String, required: true, unique: true },
    student_name: { type: String, required: true },
    password: { type: String, required: true },
    cart: [{
        file: { type: String, required: true }, // Filename in GridFS
        print_type: { type: String, required: true }, // e.g., "blackAndWhite" or "color"
        print_mode: { type: String, required: true }, // e.g., "singlePage" or "frontAndBack"
        print_block: { type: String, required: true }, // e.g., "D-block" or "P-block"
        price: { type: Number, required: true }, // Calculated price for this item
        timestamp: { type: Date, default: Date.now }, // Time when the item was added
    }],
    orders: [{
        file: { type: String, required: true },
        print_type: { type: String, required: true },
        print_mode: { type: String, required: true },
        print_block: { type: String, required: true },
        price: { type: Number, required: true },
        order_date: { type: Date, default: Date.now },
        status: { type: String, default: 'Pending' },
    }],
});

const User = mongoose.model('User', userSchema);



// Configure session middleware

app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: 'mongodb://localhost:27017/xerostation',
        collectionName: 'sessions',
    }),
    cookie: {
            maxAge: 7 * 24 * 60 * 60 * 1000, // Keep session for 7 days
            secure: false,
    } 
}));


// Middleware to check login status
app.use((req, res, next) => {
    if (req.url === '/' && !req.session.username) {
        return res.sendFile(path.join(__dirname, 'public', 'login.html'));
    }
    next();
});

// Login endpoint
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ roll_number: username });

        if (!user || user.password !== password) {
            return res.send(`
                <script>
                    alert("Invalid roll number or password");
                    window.location.href = "/";
                </script>
            `);
        }

        req.session.username = user.roll_number;
        req.session.studentName = user.student_name;
        return res.redirect('/');
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).send('Internal server error');
    }
});

// Logout endpoint
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error logging out');
        }
        res.redirect('/');
    });
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Serve the main page
app.get('/', (req, res) => {
    if (!req.session.username) {
        return res.redirect('/');
    }
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Add to cart with GridFS
app.post('/addToCart', upload.single('file'), async (req, res) => {
    console.log(req.file); // Check if the file is being uploaded
    if (!req.file) {
        return res.status(400).send('No file uploaded');
    }

    if (!req.session.username) {
        return res.status(401).send('User is not logged in');
    }

    try {
        const { color, pageMode, printblock, price } = req.body;

        const user = await User.findOne({ roll_number: req.session.username });
        if (!user) {
            return res.status(404).send('User not found');
        }

        const cartItem = {
            file: req.file.filename, // Store the filename in GridFS
            print_type: color,
            print_mode: pageMode,
            print_block: printblock,
            price: parseFloat(price),
        };

        user.cart.push(cartItem);
        await user.save();

        res.send(`<script>
            alert("Item added to cart");
            window.location.href = "/";
        </script>`);
    } catch (error) {
        console.error('Error adding to cart:', error);
        res.status(500).send('Error adding item to cart.');
    }
});

app.post('/addToCart2', async (req, res) => {
    const { file, color, pageMode, printblock, price } = req.body;
    console.log(file, color, pageMode, printblock, price);
    res.send(`<script>
                    alert("check console");
                    window.location.href = "/";
                </script>`)

})

//display pdf route
app.get('/pdf/:filename', async (req, res) => {

    if (!req.session.username) {
        return res.status(401).send('User is not logged in');
    }

    try {
        const fileCursor = gfs.find({ filename: req.params.filename });
        const files = await fileCursor.toArray();
        const file = files[0]; // Get the first file

        if (!file) {
            return res.status(404).json({
                err: 'No file exists',
            });
        }

        // Check if the file is a PDF
        if (file.contentType === 'application/pdf') {
            const readstream = gfs.openDownloadStream(file._id);
            readstream.pipe(res);
        } else {
            res.status(400).json({
                err: 'Not a PDF file',
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({
            err: 'An error occurred',
        });
    }
});

//route for cart btn
app.get('/cart', (req, res) => {
    if (!req.session.username) {
        return res.redirect('/');
    }
    res.sendFile(path.join(__dirname, 'public/cart.html'));
});

//route for home btn
app.get('/home', (req, res) => {
    if (!req.session.username) {
        return res.redirect('/');
    }
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

//route for order btn
app.get('/order', (req, res) => {
    if (!req.session.username) {
        return res.redirect('/');
    }
    res.sendFile(path.join(__dirname, 'public/orders.html'));
});


//route for fetching the cart items

app.get('/cartitems', async (req, res) => {
    try {
        // Retrieve roll number from the session
        const roll_number = req.session.username;

        if (!roll_number) {
            return res.status(401).json({ message: 'Unauthorized: No session found.' });
        }

        // Find user by roll number
        const user = await User.findOne({ roll_number });

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Respond with the user's cart
        res.status(200).json({ cart: user.cart });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'An error occurred.' });
    }
});

//route for fetching the order items

app.get('/orderitems', async (req, res) => {
    try {
        // Retrieve roll number from the session
        const roll_number = req.session.username;

        if (!roll_number) {
            return res.status(401).json({ message: 'Unauthorized: No session found.' });
        }

        // Find user by roll number
        const user = await User.findOne({ roll_number });

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Respond with the user's cart
        res.status(200).json({ orders: user.orders,  roll_number: user.roll_number });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'An error occurred.' });
    }
});



//route to delete elements form the cart 

app.delete('/deletecart/:file', async (req, res) => {
    const {file} = req.params; // Extract from route parameters
    const roll_number = req.session.username;

    if (!roll_number || !file) {
        return res.status(400).json({ error: 'roll_number and file are required' });
    }

    try {
        const result = await User.updateOne(
            { roll_number },
            { $pull: { cart: { file } } }
        );

        if (result.modifiedCount > 0) {
            res.status(200).json({ message: 'Item successfully removed from cart' });
        } else {
            res.status(404).json({ error: 'Item not found in cart or user does not exist' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


//to fetch the use details

app.get('/usrinfo',(req, res)=>{

    const usrinfo = {
        rollnum : req.session.username,
        studentName : req.session.studentName
    }

    return res.json(usrinfo)
})

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error logging out');
        }
        res.redirect('/');
    });
});

//Payment integration using Razorpay

import Razorpay from 'razorpay';

// Replace with your Razorpay credentials
const razorpay = new Razorpay({
key_id: '[Your key id]', 
key_secret: '[Your secret key]', 
});

// Function to read data from JSON file
const readData = () => {
    if (fs.existsSync('orders.json')) {
        const data = fs.readFileSync('orders.json', 'utf-8');
        return JSON.parse(data);
    }
    return []; // Return an empty array if the file doesn't exist
};

// Function to write data to JSON file
const writeData = (data) => {
    fs.writeFileSync('orders.json', JSON.stringify(data, null, 2));
};

// Initialize orders.json if it doesn't exist
if (!fs.existsSync('orders.json')) {
    writeData([]);
}

// Route to handle order creation (payment order)
app.post('/create-order', async (req, res) => {
    try {
        const { amount, currency, receipt, notes } = req.body;

        const options = {
            amount: amount * 100, // Convert amount to paise
            currency: currency,
            receipt: receipt,
            notes: notes,
        };

        // Create order using Razorpay
        const order = await razorpay.orders.create(options);

        // Read current orders, add new order, and write back to the file
        const orders = readData();
        orders.push({
            order_id: order.id,
            amount: order.amount,
            currency: order.currency,
            receipt: order.receipt,
            status: 'created',
        });
        writeData(orders);

        res.json(order);  // Send order details to frontend, including order ID
    } catch (error) {
        console.error(error);
        res.status(500).send('Error creating order');
    }
});

// Route to serve the success page

app.post('/payment-success_original', async(req, res) => {
    // res.sendFile(path.join(__dirname,'public', 'success.html'));
    res.send(
        `<script>
                    alert("payment successful");
                    window.location.href = "/cart";
        </script>`
    );
});

app.post('/payment-success', async (req, res) => {
    try {
        const roll_number = req.session.username;

        if (!roll_number) {
            return res.send(
                `<script>
                    alert("Session expired. Please log in again.");
                    window.location.href = "/login";
                </script>`
            );
        }

        const user = await User.findOne({ roll_number });

        if (!user) {
            return res.send(
                `<script>
                    alert("User not found. Please try again.");
                    window.location.href = "/cart";
                </script>`
            );
        }

        // Debug: Log cart items
        console.log("Cart contents before transferring to orders:", user.cart);

        // Validate and move items from cart to orders
        const ordersToAdd = user.cart.map(item => ({
            file: item.file,
            print_type : item.print_type,
            print_mode : item.print_mode,
            print_block : item.print_block,
            price : item.price,
            order_date : new Date(),
            status : 'Pending',
        }));

        // Add items to orders and clear the cart
        user.orders.push(...ordersToAdd);
        user.cart = [];

        await user.save();

        res.send(
            `<script>
                alert("Payment successful! Your order is being processed.");
                window.location.href = "/cart";
            </script>`
        );
    } catch (error) {
        console.error("Error processing payment:", error);
        res.send(
            `<script>
                alert("An error occurred: ${error.message}. Please try again.");
                window.location.href = "/cart";
            </script>`
        );
    }
});


// Route to handle payment verification
app.post('/verify-payment', (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const secret = razorpay.key_secret;
    const body = razorpay_order_id + '|' + razorpay_payment_id;

    try {
        const isValidSignature = validateWebhookSignature(body, razorpay_signature, secret);

        if (isValidSignature) {
            // Update the order with payment details
            const orders = readData();
            const order = orders.find(o => o.order_id === razorpay_order_id);

            if (order) {
                order.status = 'paid';
                order.payment_id = razorpay_payment_id;
                writeData(orders);
            }

            res.status(200).json({ status: 'ok' });
            console.log("Payment verification successful");



        } else {
            res.status(400).json({ status: 'verification_failed' });
            console.log("Payment verification failed");
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Error verifying payment' });
    }
});


//Admin side code 

app.get('/orders/today', async (req, res) => {
    try {
        // Get the start and end of today
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0); // Start of the day (midnight)
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999); // End of the day

        // Fetch all users whose orders have a date within today
        const users = await User.find({
            'orders.order_date': { $gte: startOfDay, $lte: endOfDay }
        }, {
            orders: 1, // Include only the `orders` field
            roll_number: 1, // Include user identifier if needed
        });

        // Extract today's orders from each user
        const todaysOrders = users.flatMap(user =>
            user.orders.filter(order =>
                order.order_date >= startOfDay && order.order_date <= endOfDay
            ).map(order => ({
                ...order.toObject(),
                roll_number: user.roll_number // Include student name for identification
            }))
        );

        res.status(200).json({ orders: todaysOrders });
    } catch (error) {
        console.error('Error fetching today\'s orders:', error);
        res.status(500).json({ error: 'Failed to fetch today\'s orders' });
    }
});


//old orders end point

app.get('/orders/excludetoday', async (req, res) => {
    try {
       // Get the start of the day 1 week ago
        const startOfDay = new Date();
        startOfDay.setDate(startOfDay.getDate() - 60); // Go back 7 days
        startOfDay.setHours(0, 0, 0, 0); // Set time to midnight

        // Get the end of yesterday
        const endOfDay = new Date();
        endOfDay.setDate(endOfDay.getDate() - 1); // Go back 1 day (yesterday)
        endOfDay.setHours(23, 59, 59, 999); // Set time to the end of the day


        // Fetch all users whose orders have a date within today
        const users = await User.find({
            'orders.order_date': { $gte: startOfDay, $lte: endOfDay }
        }, {
            orders: 1, // Include only the `orders` field
            roll_number: 1, // Include user identifier if needed
        });

        // Extract today's orders from each user
        const todaysOrders = users.flatMap(user =>
            user.orders.filter(order =>
                order.order_date >= startOfDay && order.order_date <= endOfDay
            ).map(order => ({
                ...order.toObject(),
                roll_number: user.roll_number // Include student name for identification
            }))
        );

        res.status(200).json({ orders: todaysOrders });
    } catch (error) {
        console.error('Error fetching today\'s orders:', error);
        res.status(500).json({ error: 'Failed to fetch today\'s orders' });
    }
});



//update order status from admin

app.put('/update-order-status', async (req, res) => {
    const { roll_number, file } = req.body;

    // Ensure both roll_number and file are provided
    if (!roll_number || !file) {
        return res.status(400).json({ error: 'Roll number and file are required' });
    }

    try {
        // Find the user by roll_number and update the order matching the file
        const updatedUser = await User.findOneAndUpdate(
            {
                roll_number: roll_number,
                'orders.file': file, // Match the specific order by file name
            },
            {
                $set: { 'orders.$.status': 'Completed' }, // Update the status of the matched order
            },
            { new: true } // Return the updated document
        );

        if (!updatedUser) {
            return res.status(404).json({ error: 'User or order not found' });
        }

        res.status(200).json({ message: 'Order status updated successfully', orders: updatedUser.orders });
    } catch (err) {
        console.error('Error updating order status:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

//route for admin and login of admin

// Admin route
app.get('/admin', async (req, res) => {
    if (!req.session.adminname) {
        // Redirect to admin login page if not logged in
        return res.sendFile(path.join(__dirname, 'public', 'adminlogin.html'));
    }

    // Serve admin page if logged in
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Admin login endpoint
app.post('/adminlogin', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Validate username and password
        if ((username === "D-block" && password === "1234") || 
            (username === "P-block" && password === "0987")) {

            req.session.adminname = username; // Store admin name in session
            return res.redirect('/admin');   // Redirect to admin page
        } else {
            // Send alert and redirect back to login page
            return res.send(`
                <script>
                    alert("Invalid username or password");
                    window.location.href = "/adminlogin.html";
                </script>
            `);
        }
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).send('Internal server error');
    }
});

// Logout endpoint (optional)
// Logout endpoint (partial logout)
app.get('/adminlogout', (req, res) => {
    if (req.session.adminname) {
        delete req.session.adminname; // Remove only the adminname property
    }
    res.redirect('/adminlogin.html'); // Redirect to login page
});

//fetch admin details in client side

app.get('/admininfo', (req, res) => {
    if (req.session.adminname) {
        res.json({ adminname: req.session.adminname }); // Respond with the adminname
    } else {
        res.status(401).json({ error: 'Admin not logged in' }); // Handle cases where admin is not logged in
    }
});



app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});