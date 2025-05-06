document.addEventListener("DOMContentLoaded", () => {
  const parser = new DocParser();
  const generator = new DocGenerator();

  // Elements
  const requestInput = document.getElementById("request-input");
  const responseInput = document.getElementById("response-input");
  const pathInput = document.getElementById("path-input");
  const methodSelect = document.getElementById("method-select");
  const descriptionInput = document.getElementById("description-input");
  const notesInput = document.getElementById("notes-input");
  const generateBtn = document.getElementById("generate-btn");
  const exportBtn = document.getElementById("export-btn");
  const exampleBtn = document.getElementById("example-btn");
  const previewDiv = document.getElementById("documentation-preview");

  // Generate documentation
  generateBtn.addEventListener("click", () => {
    try {
      // Collect all inputs
      const apiDoc = {
        path: pathInput.value,
        method: methodSelect.value,
        description: descriptionInput.value,
        request: JSON.parse(requestInput.value || "{}"),
        response: JSON.parse(responseInput.value || "{}"),
        notes: notesInput.value,
      };

      const docs = parser.parseAPIDoc(apiDoc);
      const html = generator.generateHTML(docs);
      previewDiv.innerHTML = html;

      // Store docs for export
      previewDiv.dataset.docs = JSON.stringify(docs);
      showNotification("Documentation generated successfully", "success");
    } catch (error) {
      showNotification(error.message, "error");
    }
  });

  // Export documentation
  // Export format configurations
  const exportFormats = {
    html: {
      label: "HTML Document",
      icon: "📄",
      filename: "api-documentation.html",
      type: "text/html",
      generate: (previewDiv, styles) => `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>API Documentation</title>
                <style>${styles}</style>
            </head>
            <body>
                <div class="container">
                    <h1>API Documentation</h1>
                    ${previewDiv.innerHTML}
                </div>
            </body>
            </html>
        `,
    },
    md: {
      label: "Markdown",
      icon: "📝",
      filename: "api-documentation.md",
      type: "text/markdown",
      generate: (docs, generator) => generator.generateMarkdown(docs),
    },
    json: {
      label: "JSON",
      icon: "{ }",
      filename: "api-documentation.json",
      type: "application/json",
      generate: (docs) => JSON.stringify(docs, null, 2),
    },
    word: {
      label: "Word Document",
      icon: "📰",
      filename: "api-documentation.doc",
      type: "application/msword",
      generate: (docs, generator) => generator.generateWord(docs),
    },
  };

  // Create custom format selection dialog
  const createFormatDialog = () => {
    const dialog = document.createElement("div");
    dialog.className = "format-dialog fade-in";
    dialog.innerHTML = `
        <div class="format-dialog-content slide-in">
            <h3>Choose Export Format</h3>
            <div class="format-options">
                ${Object.entries(exportFormats)
                  .map(
                    ([key, format]) => `
                        <button class="format-option" data-format="${key}">
                            <span class="format-icon">${format.icon}</span>
                            <span class="format-label">${format.label}</span>
                        </button>
                    `
                  )
                  .join("")}
            </div>
        </div>
    `;

    // Add dialog styles if not already present
    if (!document.getElementById("format-dialog-styles")) {
      const styles = document.createElement("style");
      styles.id = "format-dialog-styles";
      styles.textContent = `
            .format-dialog {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
            }
            
            .format-dialog-content {
                background: white;
                padding: 24px;
                border-radius: 8px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                max-width: 400px;
                width: 90%;
            }
            
            .format-dialog h3 {
                margin: 0 0 16px 0;
                color: #2c3e50;
                font-size: 1.25rem;
            }
            
            .format-options {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 12px;
            }
            
            .format-option {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 12px;
                border: 1px solid #e2e8f0;
                border-radius: 6px;
                background: white;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .format-option:hover {
                border-color: #dc2626;
                background: #fff5f5;
            }
            
            .format-icon {
                font-size: 1.25rem;
            }
            
            .format-label {
                font-size: 0.875rem;
                color: #4a5568;
            }
            
            .fade-in {
                animation: fadeIn 0.2s ease-out;
            }
            
            .slide-in {
                animation: slideIn 0.3s ease-out;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            @keyframes slideIn {
                from { 
                    opacity: 0;
                    transform: translateY(-20px);
                }
                to { 
                    opacity: 1;
                    transform: translateY(0);
                }
            }
        `;
      document.head.appendChild(styles);
    }

    return dialog;
  };

  // Export button click handler
  exportBtn.addEventListener("click", async () => {
    try {
      // Parse documentation data
      const docs = JSON.parse(previewDiv.dataset.docs || "[]");
      if (!docs.length) {
        throw new Error(
          "No documentation to export. Please generate documentation first."
        );
      }

      // Show format selection dialog
      const dialog = createFormatDialog();
      document.body.appendChild(dialog);

      // Handle format selection
      const formatPromise = new Promise((resolve, reject) => {
        dialog.addEventListener("click", (e) => {
          const formatBtn = e.target.closest(".format-option");
          if (formatBtn) {
            const format = formatBtn.dataset.format;
            dialog.remove();
            resolve(format);
          }
        });

        // Close dialog when clicking outside
        dialog.addEventListener("click", (e) => {
          if (e.target === dialog) {
            dialog.remove();
            reject(new Error("Export cancelled"));
          }
        });
      });

      const format = await formatPromise;
      const exportConfig = exportFormats[format];

      if (!exportConfig) {
        throw new Error("Invalid export format");
      }

      // Generate content based on format
      let content;
      if (format === "html") {
        content = exportConfig.generate(previewDiv, getExportStyles());
      } else if (format === "json") {
        content = exportConfig.generate(docs);
      } else {
        content = exportConfig.generate(docs, generator);
      }

      // Download the file
      await downloadFile(content, exportConfig.filename, exportConfig.type);
      showNotification("Documentation exported successfully", "success");
    } catch (error) {
      if (error.message !== "Export cancelled") {
        showNotification(error.message, "error");
      }
    }
  });

  // Load example
  exampleBtn.addEventListener("click", () => {
    const example = getExample();
    pathInput.value = example.path;
    methodSelect.value = example.method;
    descriptionInput.value = example.description;
    requestInput.value = JSON.stringify(example.request, null, 2);
    responseInput.value = JSON.stringify(example.response, null, 2);
    notesInput.value = example.notes;
  });

  // Helper functions
  function getExample() {
    return {
      path: "/api/v1/orders",
      method: "POST",
      description: "Create a new order in the system",
      request: {
        customerId: "CUST001",
        items: [
          {
            productId: "PROD001",
            quantity: 2,
            price: 39900,
          },
        ],
        shippingAddress: {
          street: "123 Main St",
          city: "Bangkok",
          postalCode: "10110",
          country: "Thailand",
        },
        paymentMethod: "CREDIT_CARD",
      },
      response: {
        id: "ORD001",
        orderNumber: "POS2024020001",
        status: "PENDING",
        customerId: "CUST001",
        total: 79800,
        items: [
          {
            productId: "PROD001",
            quantity: 2,
            price: 39900,
            subtotal: 79800,
          },
        ],
        shippingAddress: {
          street: "123 Main St",
          city: "Bangkok",
          postalCode: "10110",
          country: "Thailand",
        },
        paymentMethod: "CREDIT_CARD",
        paymentStatus: "PENDING",
        createdAt: "2024-02-04T15:30:00Z",
        estimatedDeliveryTime: "2024-02-04T16:15:00Z",
      },
      notes:
        "- Orders created after 6 PM will be processed the next business day\n- Payment must be completed within 30 minutes\n- Free shipping for orders over 50,000 THB",
    };
  }

  function getExportStyles() {
    return `
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 1200px;
                margin: 0 auto;
                padding: 20px;
            }
            .container > h1 {
                text-align: center;
                color: #2c3e50;
                margin-bottom: 30px;
            }
            .endpoint {
                margin-bottom: 30px;
                padding: 15px;
                border: 1px solid #ddd;
                border-radius: 4px;
            }
            .endpoint h3 {
                display: flex;
                align-items: center;
                gap: 10px;
                margin-bottom: 15px;
            }
            .method {
                display: inline-block;
                padding: 5px 10px;
                border-radius: 4px;
                font-weight: bold;
                color: white;
                min-width: 80px;
                text-align: center;
            }
            .method.get { background: #61affe; }
            .method.post { background: #49cc90; }
            .method.put { background: #fca130; }
            .method.delete { background: #f93e3e; }
            .param-table {
                width: 100%;
                border-collapse: collapse;
                margin: 15px 0;
                font-size: 14px;
            }
            .param-table th,
            .param-table td {
                padding: 8px;
                border: 1px solid #ddd;
                text-align: left;
            }
            .param-table th {
                background: #f5f5f5;
            }
            code {
                background: #f8f9fa;
                padding: 2px 4px;
                border-radius: 3px;
                font-family: monospace;
            }
            pre {
                background: #f8f9fa;
                padding: 15px;
                border-radius: 4px;
                overflow-x: auto;
            }
            h4 {
                margin: 20px 0 10px;
            }
        `;
  }

  function downloadFile(content, filename, type) {
    try {
      console.log(content);

      let blob;

      if (!content) {
        throw new Error("Content is required");
      }

      if (!filename) {
        throw new Error("Filename is required");
      }

      if (!type) {
        throw new Error("File type is required");
      }

      if (type === "application/msword") {
        try {
          // Create a UTF-8 encoded string with BOM
          const BOM = "\ufeff";
          const htmlContent = BOM + content;

          // Method 1: Direct UTF-8 encoding
          blob = new Blob([htmlContent], {
            type: "application/msword;charset=utf-8",
          });

          /* Alternative Method 2: If Method 1 doesn't work well
                    const encoder = new TextEncoder();
                    const utf8Array = encoder.encode(htmlContent);
                    blob = new Blob([utf8Array], {
                        type: 'application/msword;charset=utf-8'
                    });
                    */
        } catch (encodingError) {
          console.error("Error encoding Word document:", encodingError);
          throw new Error(
            "Failed to encode Word document: " + encodingError.message
          );
        }
      } else {
        // Handle other file types normally
        try {
          blob = new Blob([content], { type });
        } catch (blobError) {
          console.error("Error creating blob:", blobError);
          throw new Error("Failed to create file: " + blobError.message);
        }
      }

      // Create download URL
      let url;
      try {
        url = URL.createObjectURL(blob);
      } catch (urlError) {
        console.error("Error creating object URL:", urlError);
        throw new Error("Failed to create download URL: " + urlError.message);
      }

      // Create and setup download link
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = filename;

      // Perform download
      try {
        document.body.appendChild(a);
        a.click();
      } catch (downloadError) {
        console.error("Error triggering download:", downloadError);
        throw new Error("Failed to start download: " + downloadError.message);
      } finally {
        // Cleanup
        try {
          document.body.removeChild(a);
          // Delay URL revocation to ensure download starts
          setTimeout(() => {
            try {
              URL.revokeObjectURL(url);
            } catch (revokeError) {
              console.error("Error revoking URL:", revokeError);
            }
          }, 100);
        } catch (cleanupError) {
          console.error("Error during cleanup:", cleanupError);
        }
      }

      return true; // Indicate successful download initiation
    } catch (error) {
      console.error("Download file error:", error);
      throw error; // Re-throw to let caller handle it
    }
  }

  function showNotification(message, type = "info") {
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.classList.add("show");
    }, 100);

    setTimeout(() => {
      notification.classList.remove("show");
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  }
});
