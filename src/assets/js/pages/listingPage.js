import { UserProfileService } from '../services/userProfileService.js';
import { CacheService } from '../services/cacheService.js';
import { ListingService } from '../services/listingService.js';

export class ListingPage {

    async show()
    {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('promotion') === 'success') {
            const listingId = parseInt(urlParams.get('listing'));
            const type = urlParams.get('type');
            const expirationDate = new Date();
            if (type === 'week') {
                expirationDate.setDate(expirationDate.getDate() + 7);
            } else {
                expirationDate.setMonth(expirationDate.getMonth() + 1);
            }
            // Get listing to get category
            const listing = await ListingService.getListingById(listingId);
            if (listing) {
                await fetch('/api/Promotions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        listingId: listingId,
                        expirationDate: expirationDate.toISOString(),
                        category: listing.category
                    })
                });
                // Clean URL
                window.history.replaceState({}, '', window.location.pathname);
                alert('Listing promoted successfully!');
            }
        }

        const listingId = window.location.pathname.split('/')[2];
        const listingContainer = $('#listing-details');
        
        try {
            const listing = await ListingService.getListingById(listingId);
            if (listing) {
                let pictures = await ListingService.getListingPictures(listingId);

                let carouselHtml = '';
                if (pictures.length > 0) {
                    carouselHtml = `
                        <div class="carousel-container">
                            <div class="carousel-main">
                                <img id="carousel-big-img" src="${pictures[0]}" alt="Main Image" />
                                <div class="carousel-thumbnails">
                                    ${pictures.map((src, idx) => `
                                        <img class="carousel-thumb${idx === 0 ? ' selected' : ''}" src="${src}" data-idx="${idx}" alt="Thumbnail ${idx + 1}" />
                                    `).join('')}
                                </div>
                            </div>
                        </div>
                    `;
                }
                
                const author = await UserProfileService.getUserProfile(listing.userId);
                let listingHtml = `
                    ${carouselHtml}
                    <div class="listing-details-info">
                        <h2>${listing.title}</h2>
                        <p><strong>Location:</strong> ${listing.location || 'Location not specified'}</p>
                        <p><strong>Price:</strong> ${listing.price.toFixed(2)} EUR</p>
                        <p><strong>Description:</strong> ${listing.description || 'No description available'}</p>
                        <p class="listing-category">
                            <span><strong>Category:</strong> ${listing.category || 'None'}</span>
                            <span><strong>Posted by:</strong> <a href="/profile/${listing.userId}">${author.userName}</a></span>
                        </p>
                `;

                const currentUser = CacheService.get("current_user");
                if (currentUser && currentUser.id === listing.userId) {
                    listingHtml += `<div class="listing-buttons"><button id="edit-listing-btn">Edit Listing</button><button id="delete-listing-btn">Delete Listing</button><button id="promote-listing-btn">Promote Listing</button></div>`;
                }
                else{
                    if (currentUser) {
                        if (author.phoneNumber) {
                            listingHtml += `
                                <p id="listing-contact">
                                    <strong>Phone: </strong> ${author.phoneNumber}
                                    <button class="copy-btn" data-text="${author.phoneNumber}" title="Copy phone number">
                                        <span class="material-symbols-outlined">content_copy</span>
                                    </button>
                                </p>`;
                        } else if (author.email) {
                            listingHtml += `
                                <p id="listing-contact">
                                    <strong>Email: </strong> ${author.email}
                                    <button class="copy-btn" data-text="${author.email}" title="Copy email">
                                        <span class="material-symbols-outlined">content_copy</span>
                                    </button>
                                </p>`;
                        }
                    } else {
                        listingHtml += `<p><em>Log in to see contact details.</em></p>`;
                    }
                }
                listingHtml += `</div>`;
                
                listingContainer.html(listingHtml);
                
                // Add click event listener for copy buttons
                $('.copy-btn').on('click', function(e) {
                    e.preventDefault();
                    let textToCopy = $(this).data('text');
                    const button = this;
                    
                    // Remove whitespaces from phone numbers (keep spaces for emails)
                    if (textToCopy && textToCopy.includes('+356')) {
                        textToCopy = textToCopy.replace(/\s/g, '');
                    }
                    
                    navigator.clipboard.writeText(textToCopy).then(function() {
                        // Show temporary success message
                        const originalContent = button.innerHTML;
                        button.innerHTML = '<span class="material-symbols-outlined success">check</span>';
                        setTimeout(() => {
                            button.innerHTML = originalContent;
                        }, 1500);
                    }).catch(function(err) {
                        console.error('Failed to copy: ', err);
                        
                        // Fallback method for older browsers
                        try {
                            const textArea = document.createElement('textarea');
                            textArea.value = textToCopy;
                            document.body.appendChild(textArea);
                            textArea.select();
                            document.execCommand('copy');
                            document.body.removeChild(textArea);
                            
                            // Show success feedback
                            const originalContent = button.innerHTML;
                            button.innerHTML = '<span class="material-symbols-outlined">check</span>';
                            setTimeout(() => {
                                button.innerHTML = originalContent;
                            }, 1500);
                        } catch (fallbackErr) {
                            alert('Failed to copy to clipboard. Please copy manually: ' + textToCopy);
                        }
                    });
                });
                
                $('.carousel-thumb').on('click', function() {
                    const idx = $(this).data('idx');
                    $('#carousel-big-img').attr('src', pictures[idx]);
                    $('.carousel-thumb').removeClass('selected');
                    $(this).addClass('selected');
                });

                // Edit Listing handler
                const editBtn = document.getElementById("edit-listing-btn");
                if (editBtn) {
                    editBtn.addEventListener("click", () => this.showEditForm());
                }

                // Delete Listing handler
                const deleteBtn = document.getElementById("delete-listing-btn");
                if (deleteBtn) {
                    deleteBtn.addEventListener("click", () => this.confirmDelete(listing.id));
                }

                // Promote Listing handler
                const promoteBtn = document.getElementById("promote-listing-btn");
                if (promoteBtn) {
                    promoteBtn.addEventListener("click", () => this.promoteListing(listing.id));
                }
            } else {
                listingContainer.html('<p>Listing not found.</p>');
            }
        } catch (error) {
            console.error('Error fetching listing details:', error);
            listingContainer.html('<p>An error occurred while loading the listing details. Please try again later.</p>');
        }
    }
    
    async confirmDelete(listingId) {
        if (confirm("Are you sure you want to delete this listing? This action cannot be undone.")) {
            try {
                await ListingService.deleteListing(listingId);
                window.location.href = "/";
            } catch (error) {
                console.error("Error deleting listing:", error);
                alert("Failed to delete listing.");
            }
        }
    }

    async promoteListing(listingId) {
        // Show modal with promotion options
        const modal = document.createElement('div');
        modal.id = 'promotion-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>Promote Listing</h3>
                <select id="promotion-type">
                    <option value="week">1 Week - 2 EUR</option>
                    <option value="month">1 Month - 5 EUR</option>
                </select>
                <button id="confirm-promotion">Confirm & Pay</button>
                <button id="cancel-promotion">Cancel</button>
            </div>
        `;
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center;
            z-index: 1000;
        `;
        modal.querySelector('.modal-content').style.cssText = `
            background: white; padding: 20px; border-radius: 8px; text-align: center;
        `;
        document.body.appendChild(modal);

        document.getElementById('cancel-promotion').addEventListener('click', () => modal.remove());

        document.getElementById('confirm-promotion').addEventListener('click', async () => {
            const type = document.getElementById('promotion-type').value;
            const priceId = type === 'week' ? 'price_1S84D4CjFdJ7izyJ7cddtZCf' : 'price_1S84D4CjFdJ7izyJWk98XDT4'; // Stripe Price IDs
            // Use Stripe for payment
            const stripe = Stripe('pk_test_51S7JlICjFdJ7izyJ4a9AJUPconADc29JQKxPX8MpAfM56xvONX6HfSDgpvs5I32RZjaBq1uxCzrIbwxzzfpFIAGy00e9WUDWHI'); // Replace with your test publishable key
            const { error } = await stripe.redirectToCheckout({
                lineItems: [{ price: priceId, quantity: 1 }],
                mode: 'payment',
                successUrl: window.location.href + '?promotion=success&listing=' + listingId + '&type=' + type,
                cancelUrl: window.location.href,
            });
            if (error) {
                alert('Payment failed: ' + error.message);
            }
        });
    }

  showEditForm(){
        // Build edit form with current data as placeholder and image previews
        let editFormHtml = `
            <h3>Edit Listing</h3>
            <form id="edit-listing-form">
                <div>
                    <label for="edit-name">Title:</label>
                    <input type="text" id="edit-name" name="name" value="${listing.title}" required>
                </div>
                <div>
                    <label for="edit-description">Description:</label>
                    <textarea id="edit-description" name="description" required>${listing.description}</textarea>
                </div>
                <div>
                    <label for="edit-price">Price (EUR):</label>
                    <input type="number" id="edit-price" name="price" step="0.01" min="0" value="${listing.price}" required>
                </div>
                <div>
                    <label for="edit-category">Category:</label>
                    <select id="edit-category" name="category" required>
                        <option value="">Select a category</option>
                        <option value="Electronics" ${listing.category==='Electronics' ? 'selected' : ''}>Electronics</option>
                        <option value="Furniture" ${listing.category==='Furniture' ? 'selected' : ''}>Furniture</option>
                        <option value="Clothing" ${listing.category==='Clothing' ? 'selected' : ''}>Clothing</option>
                        <option value="Vehicles" ${listing.category==='Vehicles' ? 'selected' : ''}>Vehicles</option>
                        <option value="Real Estate" ${listing.category==='Real Estate' ? 'selected' : ''}>Real Estate</option>
                        <option value="Sports&Hobby" ${listing.category==='Sports&Hobby' ? 'selected' : ''}>Sports&Hobby</option>
                        <option value="Books" ${listing.category==='Books' ? 'selected' : ''}>Books</option>
                        <option value="Other" ${listing.category==='Other' ? 'selected' : ''}>Other</option>
                    </select>
                </div>
                <div>
                    <label>Pictures (up to 10):</label>
                    <div id="edit-picture-inputs" style="display: flex; flex-wrap: wrap; gap: 10px; margin-top: 10px;"></div>
                </div>
                <button type="submit">Save Changes</button>
            </form>
            <div id="edit-form-message"></div>
        `;
        listingContainer.html(editFormHtml);

        // Picture input logic
        const editPictureInputsDiv = document.getElementById('edit-picture-inputs');
        const editPictureFiles = Array(10).fill(null);

        for (let i = 0; i < 10; i++) {
            const wrapper = document.createElement('div');
            wrapper.style.position = 'relative';
            wrapper.style.width = '100px';
            wrapper.style.height = '100px';

            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.style.width = '100px';
            input.style.height = '100px';
            input.style.opacity = 1;
            input.dataset.idx = i;

            const preview = document.createElement('img');
            preview.style.display = 'none';
            preview.style.position = 'absolute';
            preview.style.top = '0';
            preview.style.left = '0';
            preview.style.width = '100px';
            preview.style.height = '100px';
            preview.style.objectFit = 'cover';
            preview.style.borderRadius = '6px';

            const delBtn = document.createElement('button');
            delBtn.type = 'button';
            delBtn.textContent = '✕';
            delBtn.style.position = 'absolute';
            delBtn.style.top = '2px';
            delBtn.style.right = '2px';
            delBtn.style.background = 'rgba(0,0,0,0.6)';
            delBtn.style.color = 'white';
            delBtn.style.border = 'none';
            delBtn.style.borderRadius = '50%';
            delBtn.style.width = '22px';
            delBtn.style.height = '22px';
            delBtn.style.cursor = 'pointer';
            delBtn.style.display = 'none';
            delBtn.style.zIndex = '2';

            // Prepopulate with existing image if present
            const picKey = `picture${i+1}`;
            if (listing[picKey]) {
                preview.src = listing[picKey];
                preview.style.display = 'block';
                delBtn.style.display = 'block';
                editPictureFiles[i] = null; // Will use existing image unless replaced
            }

            // Handle file input change
            input.addEventListener('change', function() {
                const idx = parseInt(this.dataset.idx);
                if (this.files && this.files[0]) {
                    const file = this.files[0];
                    if (!file.type.startsWith('image/')) {
                        alert('Only image files are allowed.');
                        this.value = '';
                        preview.style.display = 'none';
                        delBtn.style.display = 'none';
                        editPictureFiles[idx] = null;
                        return;
                    }
                    preview.src = URL.createObjectURL(file);
                    preview.style.display = 'block';
                    delBtn.style.display = 'block';
                    editPictureFiles[idx] = file;
                } else {
                    preview.style.display = 'none';
                    delBtn.style.display = 'none';
                    editPictureFiles[idx] = null;
                }
            });

            // Handle delete button
            delBtn.addEventListener('click', function() {
                input.value = '';
                preview.style.display = 'none';
                delBtn.style.display = 'none';
                editPictureFiles[i] = null;
                listing[`picture${i+1}`] = null;
            });

            wrapper.appendChild(input);
            wrapper.appendChild(preview);
            wrapper.appendChild(delBtn);
            editPictureInputsDiv.appendChild(wrapper);
        }

        // Edit form submission
        document.getElementById('edit-listing-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const editFormMessage = document.getElementById('edit-form-message');
            editFormMessage.textContent = '';

            const pictureData = {};
            try {
                for (let i = 0; i < 10; i++) {
                    const file = editPictureFiles[i];
                    if (file) {
                        const base64String = await resizeAndConvertToBase64(file, 800, 0.7);
                        pictureData[`Picture${i + 1}`] = base64String;
                    } else if (listing[`picture${i+1}`]) {
                        pictureData[`Picture${i + 1}`] = listing[`picture${i+1}`];
                    }
                }
            } catch (error) {
                console.error('Image processing error:', error);
                editFormMessage.textContent = 'Error processing images.';
                editFormMessage.style.color = 'red';
                return;
            }

            const data = {
                Title: document.getElementById('edit-name').value,
                Description: document.getElementById('edit-description').value,
                Price: parseFloat(document.getElementById('edit-price').value),
                Category: document.getElementById('edit-category').value || null,
                UserId: CacheService.get("current_user").id,
                ...pictureData
            };

            try {
                const response = await ListingService.updateListing(listing.id, data);
                if (response) {
                    editFormMessage.textContent = 'Listing updated successfully!';
                    editFormMessage.style.color = 'green';
                    loadListingDetailsPage();
                } else {
                    editFormMessage.textContent = 'Failed to update listing. Please try again.';
                    editFormMessage.style.color = 'red';
                }
            } catch (error) {
                console.error('Update listing error:', error);
                editFormMessage.textContent = 'Error updating listing.';
                editFormMessage.style.color = 'red';
            }
        });
    }

    static async showCreate() {
        const pictureInputs = $('#picture-inputs');
        pictureInputs.empty();

        // Create all 10 inputs but hide them initially
        for (let i = 0; i < 10; i++) {
            const pictureUpload = $(`
                <div class="picture-upload" id="upload-${i}" style="${i > 0 ? 'display: none;' : ''}">
                    <input type="file" id="picture-${i}" name="picture-${i}" accept="image/*">
                    <div class="picture-preview" data-for="picture-${i}">
                        <span>+</span>
                    </div>
                </div>
            `);
            pictureInputs.append(pictureUpload);
        }

        // Handle file selection and preview
        $('.picture-preview').on('click', function() {
            const inputId = $(this).data('for');
            $(`#${inputId}`).click();
        });

        $('input[type="file"]').on('change', function() {
            const file = this.files[0];
            const preview = $(`.picture-preview[data-for="${this.id}"]`);
            const currentIndex = parseInt(this.id.split('-')[1]);
            
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    preview.html(`<img src="${e.target.result}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;">`);
                };
                reader.readAsDataURL(file);
                
                // Show next input if it exists and is hidden
                if (currentIndex < 9) {
                    $(`#upload-${currentIndex + 1}`).show();
                }
            } else {
                preview.html('<span>+</span>');
                
                // Hide subsequent inputs if this one is cleared
                for (let i = currentIndex + 1; i < 10; i++) {
                    const nextInput = $(`#picture-${i}`)[0];
                    if (!nextInput.files[0]) {
                        $(`#upload-${i}`).hide();
                    } else {
                        break; // Stop if we find a filled input
                    }
                }
            }
        });

        // Handle form submit
        $('#create-listing-form').on('submit', async (e) => {
            e.preventDefault();
            const currentUser = CacheService.get("current_user");
            if (!currentUser || !currentUser.id) {
                alert("You must be logged in to create a listing.");
                return;
            }
            const formData = new FormData(e.target);
            const data = {
                title: formData.get('name'),
                description: formData.get('description'),
                price: parseFloat(formData.get('price')),
                category: formData.get('category'),
                location: formData.get('location'),
                userId: currentUser.id
            };

            const pictures = [];
            for (let i = 0; i < 10; i++) {
                const file = formData.get(`picture-${i}`);
                if (file && file.size > 0) {
                    pictures.push(file);
                }
            }

            try {
                const response = await ListingService.createListing(data);
                if (response && response.id) {
                    if (pictures.length > 0) {
                        await ListingService.addListingPictures(response.id, pictures);
                    }
                    window.location.href = `/listing/${response.id}`;
                } else {
                    $('#form-message').text('Failed to create listing.');
                }
            } catch (error) {
                console.error('Error creating listing:', error);
                $('#form-message').text('An error occurred. Please try again.');
            }
        });
    }
}
