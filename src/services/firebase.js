import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  GithubAuthProvider, 
  signInWithPopup, 
  signOut,
  onAuthStateChanged 
} from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,  
  query,
  where,
  limit,
  serverTimestamp,
  increment,
  writeBatch
} from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase configuration 
const firebaseConfig = {
  apiKey: "AIzaSyCzvCjMPOvyx3KzVVfT3TFsK4Z8Ech7o6M",
  authDomain: "blogging-platform-f6238.firebaseapp.com",
  projectId: "blogging-platform-f6238",
  storageBucket: "blogging-platform-f6238.appspot.com",
  messagingSenderId: "535343349295",
  appId: "1:535343349295:web:4519487f4d1fae5c3f90da",
};

// Initialize Firebase services
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);
const storage = getStorage(app);
const GoogleAuth = new GoogleAuthProvider();
const GithubAuth = new GithubAuthProvider();


// AUTHENTICATION FUNCTIONS
// Sign in with Google account
export const googleSignIn = async () => {
  try {
    const result = await signInWithPopup(auth, GoogleAuth);
    await createOrUpdateUserProfile(result.user);
    console.log('User signed in with Google:', result.user.email);
    return result;
  } catch (error) {
    console.error('Google sign-in failed:', error);
    throw error;
  }
};

// Sign in with GitHub account
export const githubSignIn = async () => {
  try {
    const result = await signInWithPopup(auth, GithubAuth);
    await createOrUpdateUserProfile(result.user);
    console.log('User signed in with GitHub:', result.user.email);
    return result;
  } catch (error) {
    console.error('GitHub sign-in failed:', error);
    throw error;
  }
};

// Sign out the current user
export const logOut = () => {
  console.log('User signing out...');
  return signOut(auth);
};


// USER PROFILE MANAGEMENT
// Create a new user profile or update existing one after login
export const createOrUpdateUserProfile = async (user) => {
  try {
    const userDoc = doc(firestore, "users", user.uid);
    const userSnapshot = await getDoc(userDoc);
    
    if (!userSnapshot.exists()) {
      // New user - create profile with reader role by default
      const newUserData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        role: "reader", // Default role for new users - read-only access
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp()
      };
      
      await setDoc(userDoc, newUserData);
      console.log('Created new user profile with reader role:', user.email);
    } else {
      // Existing user - just update last login time
      await updateDoc(userDoc, {
        lastLogin: serverTimestamp()
      });
      console.log('Updated login time for existing user:', user.email);
    }
    
    return await getDoc(userDoc);
  } catch (error) {
    console.error('Error creating/updating user profile:', error);
    throw error;
  }
};

// Get a user's profile data by their UID
export const getUserProfile = async (uid) => {
  try {
    const userDoc = doc(firestore, "users", uid);
    const userSnapshot = await getDoc(userDoc);
    return userSnapshot.exists() ? { id: userSnapshot.id, ...userSnapshot.data() } : null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

// Update a user's role (admin only function)
export const updateUserRole = async (uid, newRole) => {
  try {
    const userDoc = doc(firestore, "users", uid);
    await updateDoc(userDoc, { role: newRole });
    console.log(`Updated user ${uid} role to: ${newRole}`);
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
};

// Update a user's profile information
export const updateUserProfile = async (uid, profileData) => {
  try {
    const userDoc = doc(firestore, "users", uid);
    await updateDoc(userDoc, {
      ...profileData,
      updatedAt: serverTimestamp()
    });
    console.log('Profile updated successfully for user:', uid);
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// BLOG POST FUNCTIONS
// Create a new blog post (starts as draft)
export const createBlogPost = async (postData, authorId) => {
  try {
    const newPost = {
      ...postData,
      authorId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      likes: 0,
      comments: 0,
      status: "draft" // All new posts start as drafts
    };
    
    const docRef = await addDoc(collection(firestore, "posts"), newPost);
    return docRef.id;
  } catch (error) {
    console.error('Failed to create blog post:', error);
    throw error;
  }
};

// Get published blog posts for public viewing
export const getBlogPosts = async (limitCount = 50) => {
  try {
    // Get posts from Firestore - we'll filter on the client side to avoid index requirements
    const q = limitCount 
      ? query(collection(firestore, "posts"), limit(limitCount * 2))
      : query(collection(firestore, "posts"));
      
    const querySnapshot = await getDocs(q);
    const posts = [];
    
    // Only include approved posts in public feed
    querySnapshot.forEach((doc) => {
      const postData = { id: doc.id, ...doc.data() };
      if (postData.status === "approved") {
        posts.push(postData);
      }
    });
    
    // Sort by creation date (newest first)
    posts.sort((a, b) => {
      const aTime = a.createdAt?.toDate?.() || new Date(0);
      const bTime = b.createdAt?.toDate?.() || new Date(0);
      return bTime - aTime;
    });
    
    // Apply limit after filtering
    return limitCount ? posts.slice(0, limitCount) : posts;
  } catch (error) {
    console.error('Failed to fetch blog posts:', error);
    throw error;
  }
};

// Find a blog post by its URL slug
export const getBlogPostBySlug = async (slug) => {
  try {
    const q = query(collection(firestore, "posts"), where("slug", "==", slug));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    }
    
    return null;
  } catch (error) {
    console.error('Failed to fetch post by slug:', error);
    return null;
  }
};

// Get a specific blog post by ID
export const getBlogPost = async (postId) => {
  try {
    const postDoc = doc(firestore, "posts", postId);
    const postSnapshot = await getDoc(postDoc);
    
    if (postSnapshot.exists()) {
      return { id: postSnapshot.id, ...postSnapshot.data() };
    }
    
    return null;
  } catch (error) {
    console.error('Failed to fetch blog post:', error);
    return null;
  }
};

// Update an existing blog post
export const updateBlogPost = async (postId, updateData) => {
  try {
    const postDoc = doc(firestore, "posts", postId);
    await updateDoc(postDoc, {
      ...updateData,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Failed to update blog post:', error);
    throw error;
  }
};

// Delete a blog post permanently
export const deleteBlogPost = async (postId) => {
  try {
    await deleteDoc(doc(firestore, "posts", postId));
  } catch (error) {
    console.error('Failed to delete blog post:', error);
    throw error;
  }
};

// COMMENT FUNCTIONS
// Add a new comment to a blog post
export const addComment = async (postId, commentData, userId) => {
  try {
    // Create the comment document
    const docRef = await addDoc(collection(firestore, "comments"), {
      postId,
      userId,
      content: commentData.content,
      createdAt: serverTimestamp()
    });
    
    // Update the post's comment count
    const postDoc = doc(firestore, "posts", postId);
    await updateDoc(postDoc, {
      comments: increment(1)
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Failed to add comment:', error);
    throw error;
  }
};

// Get all comments for a specific post
export const getCommentsByPost = async (postId) => {
  try {
    const q = query(
      collection(firestore, "comments"),
      where("postId", "==", postId)
    );
    
    const querySnapshot = await getDocs(q);
    const comments = [];
    
    querySnapshot.forEach((doc) => {
      comments.push({ id: doc.id, ...doc.data() });
    });
    
    // Sort comments by creation date (newest first)
    return comments.sort((a, b) => {
      const aDate = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
      const bDate = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
      return bDate - aDate;
    });
  } catch (error) {
    console.error('Failed to fetch comments:', error);
    return [];
  }
};


// LIKE FUNCTIONS
// Toggle like status for a post (like/unlike)
export const toggleLike = async (postId, userId) => {
  try {
    const likeDoc = doc(firestore, "likes", `${postId}_${userId}`);
    const likeSnapshot = await getDoc(likeDoc);
    const postDoc = doc(firestore, "posts", postId);
    
    if (likeSnapshot.exists()) {
      // User already liked this post - remove like
      await deleteDoc(likeDoc);
      await updateDoc(postDoc, {
        likes: increment(-1)
      });
      return false; // Post is now unliked
    } else {
      // User hasn't liked this post - add like
      await setDoc(likeDoc, {
        postId,
        userId,
        createdAt: serverTimestamp()
      });
      await updateDoc(postDoc, {
        likes: increment(1)
      });
      return true; // Post is now liked
    }
  } catch (error) {
    console.error('Failed to toggle like:', error);
    throw error;
  }
};

// Check if a user has liked a specific post
export const isPostLiked = async (postId, userId) => {
  if (!userId) return false;
  
  try {
    const likeDoc = doc(firestore, "likes", `${postId}_${userId}`);
    const likeSnapshot = await getDoc(likeDoc);
    return likeSnapshot.exists();
  } catch (error) {
    console.error('Failed to check like status:', error);
    return false;
  }
};

// SAVED POSTS FUNCTIONS
// Toggle save status for a post (save/unsave)
export const toggleSavePost = async (postId, userId) => {
  try {
    const saveDoc = doc(firestore, "saved_posts", `${postId}_${userId}`);
    const saveSnapshot = await getDoc(saveDoc);
    
    if (saveSnapshot.exists()) {
      // Post is already saved - remove it
      await deleteDoc(saveDoc);
      return false; // Post is now unsaved
    } else {
      // Post is not saved - save it
      await setDoc(saveDoc, {
        postId,
        userId,
        createdAt: serverTimestamp()
      });
      return true; // Post is now saved
    }
  } catch (error) {
    console.error('Failed to toggle save status:', error);
    throw error;
  }
};

// Check if a user has saved a specific post
export const isPostSaved = async (postId, userId) => {
  if (!userId) return false;
  
  try {
    const saveDoc = doc(firestore, "saved_posts", `${postId}_${userId}`);
    const saveSnapshot = await getDoc(saveDoc);
    return saveSnapshot.exists();
  } catch (error) {
    console.error('Failed to check save status:', error);
    return false;
  }
};

// Get all saved posts for a user
export const getSavedPosts = async (userId) => {
  try {
    // Get saved post references for this user
    const q = query(
      collection(firestore, "saved_posts"),
      where("userId", "==", userId)
    );
    
    const querySnapshot = await getDocs(q);
    const savedPostData = [];
    
    querySnapshot.forEach((doc) => {
      savedPostData.push({ id: doc.id, ...doc.data() });
    });
    
    // Sort by save date (newest first)
    savedPostData.sort((a, b) => {
      const aDate = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
      const bDate = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
      return bDate - aDate;
    });
    
    // Fetch the actual post data for each saved post
    const savedPosts = [];
    for (const saveData of savedPostData) {
      try {
        const post = await getBlogPost(saveData.postId);
        if (post) {
          savedPosts.push(post);
        }
      } catch (error) {
        console.warn('Could not fetch saved post:', saveData.postId);
      }
    }
    
    return savedPosts;
  } catch (error) {
    console.error('Failed to fetch saved posts:', error);
    return [];
  }
};

// ROLE MANAGEMENT & PERMISSIONS
// User role constants
export const ROLES = {
  ADMIN: "admin",
  EDITOR: "editor", 
  READER: "reader"
};

// Check if user has any of the required roles
export const hasPermission = (userRole, requiredRoles) => {
  if (!userRole || !requiredRoles) return false;
  return requiredRoles.includes(userRole);
};

// Check if user can create new posts
export const canCreatePosts = (userRole) => {
  return hasPermission(userRole, [ROLES.ADMIN, ROLES.EDITOR]);
};

// Check if user can edit a specific post (must be author)
export const canEditPost = (userRole, postAuthorId, userId) => {
  if (!userRole || !userId || !postAuthorId) {
    return false;
  }
  
  // Only admins and editors can edit posts, and only their own posts
  const hasEditRole = userRole === ROLES.ADMIN || userRole === ROLES.EDITOR;
  const isAuthor = postAuthorId === userId;
  
  return hasEditRole && isAuthor;
};

// Check if user can delete a specific post (must be author)
export const canDeletePost = (userRole, postAuthorId, userId) => {
  if (!userRole || !userId || !postAuthorId) {
    return false;
  }
  
  // Only admins and editors can delete posts, and only their own posts
  const hasDeleteRole = userRole === ROLES.ADMIN || userRole === ROLES.EDITOR;
  const isAuthor = postAuthorId === userId;
  
  return hasDeleteRole && isAuthor;
};

// Check if user can access admin panel
export const canAccessAdmin = (userRole) => {
  return userRole === ROLES.ADMIN;
};

// Check if user can manage other users
export const canManageUsers = (userRole) => {
  return userRole === ROLES.ADMIN;
};

// ADMIN FUNCTIONS
// Get all users (admin only)
export const getAllUsers = async () => {
  try {
    const querySnapshot = await getDocs(collection(firestore, "users"));
    const users = [];
    querySnapshot.forEach((doc) => {
      users.push({ id: doc.id, ...doc.data() });
    });
    return users;
  } catch (error) {
    console.error('Failed to fetch all users:', error);
    throw error;
  }
};

// Get all posts regardless of status (admin only)
export const getAllPosts = async () => {
  try {
    const querySnapshot = await getDocs(collection(firestore, "posts"));
    const posts = [];
    
    querySnapshot.forEach((doc) => {
      posts.push({ id: doc.id, ...doc.data() });
    });
    
    // Sort by creation date (newest first)
    posts.sort((a, b) => {
      const aTime = a.createdAt?.toDate?.() || new Date(0);
      const bTime = b.createdAt?.toDate?.() || new Date(0);
      return bTime - aTime;
    });
    
    return posts;
  } catch (error) {
    console.error('Failed to fetch all posts:', error);
    throw error;
  }
};

// Fix posts that are missing authorId field (admin utility)
export const fixPostsWithoutAuthorId = async (defaultAuthorId) => {
  try {
    const querySnapshot = await getDocs(collection(firestore, "posts"));
    let fixedCount = 0;
    
    const postsToFix = [];
    querySnapshot.forEach((doc) => {
      const postData = doc.data();
      if (!postData.authorId) {
        postsToFix.push({
          docRef: doc.ref,
          title: postData.title
        });
        fixedCount++;
      }
    });
    
    // Update posts that need fixing
    for (const post of postsToFix) {
      await updateDoc(post.docRef, { 
        authorId: defaultAuthorId, 
        updatedAt: serverTimestamp() 
      });
    }
    
    return fixedCount;
  } catch (error) {
    console.error('Failed to fix posts without authorId:', error);
    throw error;
  }
};


// UTILITY FUNCTIONS
// Simple helper for date formatting
const formatDate = (timestamp) => {
  if (!timestamp) return "No date";
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString();
};

// Get current user information for debugging
export const getCurrentUserInfo = (user) => {
  if (!user) {
    return null;
  }
  
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    role: user.role,
    photoURL: user.photoURL
  };
};

// Assign current user as author to posts missing authorId
export const fixPostsForCurrentUser = async (user) => {
  if (!user || !user.uid) {
    throw new Error("No user provided or user missing UID");
  }
  
  try {
    const querySnapshot = await getDocs(collection(firestore, "posts"));
    let fixedCount = 0;
    
    for (const docSnapshot of querySnapshot.docs) {
      const postData = docSnapshot.data();
      if (!postData.authorId) {
        await updateDoc(docSnapshot.ref, {
          authorId: user.uid,
          updatedAt: serverTimestamp()
        });
        fixedCount++;
      }
    }
    
    return fixedCount;
  } catch (error) {
    console.error('Failed to fix posts for current user:', error);
    throw error;
  }
};


// NOTIFICATION FUNCTIONS
// Create a new notification
export const createNotification = async (notificationData) => {
  try {
    const notification = {
      ...notificationData,
      createdAt: serverTimestamp(),
      read: false
    };
    
    const docRef = await addDoc(collection(firestore, "notifications"), notification);
    return docRef.id;
  } catch (error) {
    console.error('Failed to create notification:', error);
    throw error;
  }
};

// Get unread notifications for a user
export const getUserNotifications = async (userId) => {
  try {
    const q = query(
      collection(firestore, "notifications"),
      where("userId", "==", userId),
      where("read", "==", false),
      limit(50)
    );
    
    const querySnapshot = await getDocs(q);
    const notifications = [];
    
    querySnapshot.forEach((doc) => {
      notifications.push({ id: doc.id, ...doc.data() });
    });
    
    // Sort by creation date (newest first)
    notifications.sort((a, b) => {
      const aTime = a.createdAt?.toDate?.() || new Date(0);
      const bTime = b.createdAt?.toDate?.() || new Date(0);
      return bTime - aTime;
    });
    
    return notifications;
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
    return [];
  }
};

// Mark a notification as read
export const markNotificationAsRead = async (notificationId) => {
  try {
    const notificationDoc = doc(firestore, "notifications", notificationId);
    await updateDoc(notificationDoc, { read: true });
  } catch (error) {
    console.error('Failed to mark notification as read:', error);
    throw error;
  }
};

// Get count of unread notifications
export const getUnreadNotificationCount = async (userId) => {
  try {
    const q = query(
      collection(firestore, "notifications"),
      where("userId", "==", userId),
      where("read", "==", false)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
  } catch (error) {
    console.error('Failed to get unread notification count:', error);
    return 0;
  }
};


// POST APPROVAL WORKFLOW
// Submit a post for admin review
export const submitPostForReview = async (postId) => {
  try {
    const postDoc = doc(firestore, "posts", postId);
    const postSnap = await getDoc(postDoc);
    
    if (!postSnap.exists()) {
      throw new Error("Post not found");
    }
    
    const postData = postSnap.data();
    
    // Update post status to pending
    await updateDoc(postDoc, {
      status: "pending",
      submittedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    // Notify all admins about the submission
    const adminsQuery = query(
      collection(firestore, "users"),
      where("role", "==", "admin")
    );
    const adminsSnapshot = await getDocs(adminsQuery);
    
    // Create notifications for all admins
    for (const adminDoc of adminsSnapshot.docs) {
      const adminData = adminDoc.data();
      await createNotification({
        userId: adminData.uid,
        type: "post_submitted",
        postId: postId,
        postTitle: postData.title,
        message: `New post "${postData.title}" submitted for review by ${postData.author?.displayName || 'an editor'}.`,
        authorId: postData.authorId
      });
    }
  } catch (error) {
    console.error('Failed to submit post for review:', error);
    throw error;
  }
};

// Get posts pending admin approval
export const getPendingPosts = async () => {
  try {
    const q = query(
      collection(firestore, "posts"),
      where("status", "==", "pending")
    );
    
    const querySnapshot = await getDocs(q);
    const posts = [];
    
    // Fetch author information for each post
    for (const docSnap of querySnapshot.docs) {
      const postData = { id: docSnap.id, ...docSnap.data() };
      
      if (postData.authorId) {
        try {
          const authorDoc = await getDoc(doc(firestore, "users", postData.authorId));
          if (authorDoc.exists()) {
            postData.author = authorDoc.data();
          }
        } catch (error) {
          console.warn('Could not fetch author info for post:', postData.id);
        }
      }
      
      posts.push(postData);
    }
    
    // Sort by submission date (newest first)
    posts.sort((a, b) => {
      const aTime = a.submittedAt?.toDate?.() || new Date(0);
      const bTime = b.submittedAt?.toDate?.() || new Date(0);
      return bTime - aTime;
    });
    
    return posts;
  } catch (error) {
    console.error('Failed to fetch pending posts:', error);
    return [];
  }
};

// Approve a pending post
export const approvePost = async (postId, adminId) => {
  try {
    const postDoc = doc(firestore, "posts", postId);
    const postSnap = await getDoc(postDoc);
    
    if (!postSnap.exists()) {
      throw new Error("Post not found");
    }
    
    const postData = postSnap.data();
    
    // Update post status to approved
    await updateDoc(postDoc, {
      status: "approved",
      reviewedBy: adminId,
      reviewedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    // Notify the author
    if (postData.authorId) {
      await createNotification({
        userId: postData.authorId,
        type: "post_approved",
        postId: postId,
        postTitle: postData.title,
        message: `Your post "${postData.title}" has been approved and is now live!`,
        adminId: adminId
      });
    }
  } catch (error) {
    console.error('Failed to approve post:', error);
    throw error;
  }
};

// Reject a pending post
export const rejectPost = async (postId, adminId, rejectionReason = "") => {
  try {
    const postDoc = doc(firestore, "posts", postId);
    const postSnap = await getDoc(postDoc);
    
    if (!postSnap.exists()) {
      throw new Error("Post not found");
    }
    
    const postData = postSnap.data();
    
    // Update post status back to draft with rejection reason
    await updateDoc(postDoc, {
      status: "draft",
      rejectionReason: rejectionReason,
      reviewedBy: adminId,
      reviewedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    // Notify the author
    if (postData.authorId) {
      const message = rejectionReason 
        ? `Your post "${postData.title}" needs revision. Reason: ${rejectionReason}`
        : `Your post "${postData.title}" needs revision. Please check and resubmit.`;
        
      await createNotification({
        userId: postData.authorId,
        type: "post_rejected",
        postId: postId,
        postTitle: postData.title,
        message: message,
        rejectionReason: rejectionReason,
        adminId: adminId
      });
    }
  } catch (error) {
    console.error('Failed to reject post:', error);
    throw error;
  }
};

// Delete a post as admin with notification
export const deletePostByAdmin = async (postId, adminId) => {
  try {
    const postDoc = doc(firestore, "posts", postId);
    const postSnap = await getDoc(postDoc);
    
    if (!postSnap.exists()) {
      throw new Error("Post not found");
    }
    
    const postData = postSnap.data();
    
    // Notify the author before deletion
    if (postData.authorId) {
      await createNotification({
        userId: postData.authorId,
        type: "post_deleted",
        postId: postId,
        postTitle: postData.title,
        message: `Your post "${postData.title}" has been deleted by an administrator.`,
        adminId: adminId
      });
    }
    
    // Delete the post
    await deleteDoc(postDoc);
  } catch (error) {
    console.error('Failed to delete post by admin:', error);
    throw error;
  }
};

// Bulk approve or reject multiple posts
export const bulkApproveRejectPosts = async (postIds, action, adminId, rejectionReason = "") => {
  try {
    const batch = writeBatch(firestore);
    const notifications = [];
    
    for (const postId of postIds) {
      const postDoc = doc(firestore, "posts", postId);
      const postSnap = await getDoc(postDoc);
      
      if (postSnap.exists()) {
        const postData = postSnap.data();
        
        if (action === "approve") {
          batch.update(postDoc, {
            status: "approved",
            reviewedBy: adminId,
            reviewedAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
          
          if (postData.authorId) {
            notifications.push({
              userId: postData.authorId,
              type: "post_approved",
              postId: postId,
              postTitle: postData.title,
              message: `Your post "${postData.title}" has been approved and is now live!`,
              adminId: adminId
            });
          }
        } else if (action === "reject") {
          batch.update(postDoc, {
            status: "draft",
            rejectionReason: rejectionReason,
            reviewedBy: adminId,
            reviewedAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
          
          if (postData.authorId) {
            const message = rejectionReason 
              ? `Your post "${postData.title}" needs revision. Reason: ${rejectionReason}`
              : `Your post "${postData.title}" needs revision. Please check and resubmit.`;
              
            notifications.push({
              userId: postData.authorId,
              type: "post_rejected",
              postId: postId,
              postTitle: postData.title,
              message: message,
              rejectionReason: rejectionReason,
              adminId: adminId
            });
          }
        }
      }
    }
    
    // Execute batch update
    await batch.commit();
    
    // Create notifications
    for (const notificationData of notifications) {
      await createNotification(notificationData);
    }
  } catch (error) {
    console.error(`Failed to bulk ${action} posts:`, error);
    throw error;
  }
};

// Get user's own posts (with all statuses for editors)
export const getUserPosts = async (userId, includeAllStatuses = false) => {
  try {
    let q;
    if (includeAllStatuses) {
      // For editors to see all their posts regardless of status
      q = query(
        collection(firestore, "posts"),
        where("authorId", "==", userId)
      );
    } else {
      // For public display - only approved posts
      q = query(
        collection(firestore, "posts"),
        where("authorId", "==", userId),
        where("status", "==", "approved")
      );
    }
    
    const querySnapshot = await getDocs(q);
    const posts = [];
    
    querySnapshot.forEach((doc) => {
      posts.push({ id: doc.id, ...doc.data() });
    });
    
    // Sort by update date (newest first)
    posts.sort((a, b) => {
      const aTime = a.updatedAt?.toDate?.() || new Date(0);
      const bTime = b.updatedAt?.toDate?.() || new Date(0);
      return bTime - aTime;
    });
    
    return posts;
  } catch (error) {
    console.error('Failed to fetch user posts:', error);
    return [];
  }
};


// PERMISSION-CHECKED FUNCTIONS
// Create blog post with permission check
export const createBlogPostWithPermission = async (postData, user) => {
  if (!canCreatePosts(user.role)) {
    throw new Error("You don't have permission to create posts");
  }
  return await createBlogPost(postData, user.uid);
};

// Update blog post with permission check
export const updateBlogPostWithPermission = async (postId, updateData, user) => {
  try {
    const postDoc = doc(firestore, "posts", postId);
    const postSnapshot = await getDoc(postDoc);
    
    if (!postSnapshot.exists()) {
      throw new Error("Post not found");
    }
    
    const post = postSnapshot.data();
    if (!canEditPost(user.role, post.authorId, user.uid)) {
      throw new Error("You don't have permission to edit this post");
    }
    
    return await updateBlogPost(postId, updateData);
  } catch (error) {
    console.error('Failed to update blog post with permission check:', error);
    throw error;
  }
};

// Delete blog post with permission check
export const deleteBlogPostWithPermission = async (postId, user) => {
  try {
    const postDoc = doc(firestore, "posts", postId);
    const postSnapshot = await getDoc(postDoc);
    
    if (!postSnapshot.exists()) {
      throw new Error("Post not found");
    }
    
    const post = postSnapshot.data();
    if (!canDeletePost(user.role, post.authorId, user.uid)) {
      throw new Error("You don't have permission to delete this post");
    }
    
    return await deleteBlogPost(postId);
  } catch (error) {
    console.error('Failed to delete blog post with permission check:', error);
    throw error;
  }
};

// Get all users with permission check
export const getAllUsersWithPermission = async (user) => {
  if (!canAccessAdmin(user.role)) {
    throw new Error("You don't have permission to view all users");
  }
  return await getAllUsers();
};

// Update user role with permission check
export const updateUserRoleWithPermission = async (uid, newRole, user) => {
  if (!canManageUsers(user.role)) {
    throw new Error("You don't have permission to update user roles");
  }
  
  // Prevent users from changing their own role
  if (uid === user.uid) {
    throw new Error("You cannot change your own role");
  }
  
  if (!Object.values(ROLES).includes(newRole)) {
    throw new Error("Invalid role specified");
  }
  
  return await updateUserRole(uid, newRole);
};

// Enhanced auth state listener with profile loading
export const onAuthStateChangedEnhanced = (callback) => {
  return onAuthStateChanged(auth, async (user) => {
    try {
      if (user) {
        const userProfile = await getUserProfile(user.uid);
        if (userProfile) {
          callback({ ...user, ...userProfile });
        } else {
          // Create profile for new user and return with reader role
          await createOrUpdateUserProfile(user);
          callback({ ...user, role: "reader" });
        }
      } else {
        callback(null);
      }
    } catch (error) {
      console.error('Error in enhanced auth state change:', error);
      // Fallback: return user with default role if profile loading fails
      if (user) {
        callback({ ...user, role: "reader" });
      } else {
        callback(null);
      }
    }
  });
};

// Export Firebase instances for direct use
export { auth, firestore, storage };
