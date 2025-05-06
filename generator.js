class DocGenerator {
    generateHTML(docs) {
        let html = '';
        for (const doc of docs) {
            html += this.generateEndpointDoc(doc);
        }
        return html;
    }

    generateEndpointDoc(doc) {
        return `
            <div class="endpoint">
                <h3>
                    <span class="method ${doc.method.toLowerCase()}">${doc.method}</span>
                    <code>${doc.path}</code>
                </h3>
                
                <div class="description">${doc.description}</div>

                ${doc.notes ? `
                <div class="notes">
                    <h4>Additional Notes</h4>
                    <pre>${this.escapeHTML(doc.notes)}</pre>
                </div>
                ` : ''}
                
                ${this.generateParamsSection(doc.params)}
                
                ${this.generateRequestExample(doc.requestExample)}
                
                ${this.generateReturnsSection(doc.returns)}
                
                ${this.generateResponseExample(doc.responseExample)}
            </div>
        `;
    }

    generateParamsSection(params) {
        if (!params || !params.length) return '';

        return `
            <div class="params">
                <h4>Request Parameters</h4>
                <table class="param-table">
                    <thead>
                        <tr>
                            <th>Field</th>
                            <th>Type</th>
                            <th>Required</th>
                            <th>Description</th>
                            <th>Example</th>
                            <th>Notes</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${params.map(param => `
                            <tr>
                                <td><code>${param.name}</code></td>
                                <td><code>${param.type}</code></td>
                                <td>${param.required ? '✓' : '✗'}</td>
                                <td>${param.description}</td>
                                <td><code>${this.escapeHTML(param.example)}</code></td>
                                <td><small>${param.notes || '-'}</small></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    generateRequestExample(example) {
        if (!example) return '';
        return `
            <div class="example">
                <h4>Request Example</h4>
                <pre><code>${this.escapeHTML(example)}</code></pre>
            </div>
        `;
    }

    generateReturnsSection(returns) {
        if (!returns) return '';

        return `
            <div class="returns">
                <h4>Response</h4>
                <p><strong>Description:</strong> ${returns.description}</p>
                ${this.generateResponseFieldsTable(returns.fields)}
            </div>
        `;
    }

    generateResponseFieldsTable(fields) {
        if (!fields || !fields.length) return '';

        return `
            <div class="response-fields">
                <h4>Response Fields</h4>
                <table class="param-table">
                    <thead>
                        <tr>
                            <th>Field</th>
                            <th>Type</th>
                            <th>Description</th>
                            <th>Example</th>
                            <th>Notes</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${fields.map(field => `
                            <tr>
                                <td><code>${field.name}</code></td>
                                <td><code>${field.type}</code></td>
                                <td>${field.description}</td>
                                <td><code>${this.escapeHTML(field.example)}</code></td>
                                <td><small>${field.notes || '-'}</small></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    generateResponseExample(example) {
        if (!example) return '';
        return `
            <div class="example">
                <h4>Response Example</h4>
                <pre><code>${this.escapeHTML(example)}</code></pre>
            </div>
        `;
    }

    generateWord(docs) {
        // Helper function to escape HTML characters
        function escapeHtml(text) {
            if (!text) return '';
            return text.toString()
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
        }
    
        // Helper function to safely format complex values
        function formatValue(value, type) {
            if (!value) return '';
            
            if (type === 'array<object>' || type === 'object') {
                try {
                    if (typeof value === 'string') {
                        const parsed = JSON.parse(value);
                        return escapeHtml(JSON.stringify(parsed, null, 2));
                    }
                    return escapeHtml(JSON.stringify(value, null, 2));
                } catch (e) {
                    return escapeHtml(String(value));
                }
            }
            return escapeHtml(String(value));
        }
    
        // Helper function to format type display
        function formatType(type) {
            if (!type) return '';
            return type.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        }
    
        // Helper function to generate parameters table
        function generateParamsTable(params) {
            if (!params || !params.length) return '';
            
            return `
                <table>
                    <tr>
                        <th style="width: 15%">Name</th>
                        <th style="width: 15%">Type</th>
                        <th style="width: 25%">Description</th>
                        <th style="width: 10%">Required</th>
                        <th style="width: 20%">Example</th>
                        <th style="width: 15%">Notes</th>
                    </tr>
                    ${params.map(param => `
                        <tr>
                            <td>${escapeHtml(param.name || '')}</td>
                            <td style="font-family: 'Courier New', monospace">${formatType(param.type || '')}</td>
                            <td>${escapeHtml(param.description || '')}</td>
                            <td>${param.required ? 'Yes' : 'No'}</td>
                            <td style="font-family: 'Courier New', monospace; white-space: pre-wrap">${formatValue(param.example, param.type)}</td>
                            <td>${escapeHtml(param.notes || '')}</td>
                        </tr>
                    `).join('')}
                </table>`;
        }
    
        // Helper function to generate returns table
        function generateReturnsTable(returns) {
            if (!returns || !returns.fields) return '';
            
            return `
                <table>
                    <tr>
                        <th style="width: 15%">Name</th>
                        <th style="width: 15%">Type</th>
                        <th style="width: 25%">Description</th>
                        <th style="width: 10%">Required</th>
                        <th style="width: 20%">Example</th>
                        <th style="width: 15%">Notes</th>
                    </tr>
                    ${returns.fields.map(field => `
                        <tr>
                            <td>${escapeHtml(field.name || '')}</td>
                            <td style="font-family: 'Courier New', monospace">${formatType(field.type || '')}</td>
                            <td>${escapeHtml(field.description || '')}</td>
                            <td>${field.required ? 'Yes' : 'No'}</td>
                            <td style="font-family: 'Courier New', monospace; white-space: pre-wrap"><pre>${formatValue(field.example, field.type)}</pre></td>
                            <td>${escapeHtml(field.notes || '')}</td>
                        </tr>
                    `).join('')}
                </table>`;
        }
    
        // Helper function to generate endpoint documentation
        function generateEndpointDoc(doc) {
            return `
                <div class="endpoint" style="margin-bottom: 30pt; page-break-inside: avoid">
                    <h2 style="margin-top: 20pt; margin-bottom: 10pt">
                        <span style="background-color: ${doc.method.toLowerCase() === 'post' ? '#49cc90' : '#61affe'}; 
                                    color: white; 
                                    padding: 5pt 10pt; 
                                    font-weight: bold">${doc.method}</span>
                        <span style="margin-left: 10pt">${escapeHtml(doc.path)}</span>
                    </h2>
                    <p style="margin-bottom: 10pt">${escapeHtml(doc.description || '')}</p>
                    
                    ${doc.notes ? `
                        <h3 style="margin-top: 15pt; margin-bottom: 5pt">Notes:</h3>
                        <ul>
                            ${doc.notes.split('\n').map(note => `
                                <li>${escapeHtml(note.replace(/^-\s*/, ''))}</li>
                            `).join('')}
                        </ul>
                    ` : ''}
                    
                    <h3 style="margin-top: 15pt; margin-bottom: 5pt">Request Parameters</h3>
                    ${generateParamsTable(doc.params)}
                    
                    <h3 style="margin-top: 15pt; margin-bottom: 5pt">Response</h3>
                    ${generateReturnsTable(doc.returns)}
                    
                    ${doc.requestExample ? `
                        <h3 style="margin-top: 15pt; margin-bottom: 5pt">Request Example</h3>
                        <div style="font-family: 'Courier New', monospace; 
                                   background-color: #f5f5f5; 
                                   padding: 10pt; 
                                   white-space: pre-wrap"><pre>${formatValue(doc.requestExample, 'object')}</pre></div>
                    ` : ''}
                    
                    ${doc.responseExample ? `
                        <h3 style="margin-top: 15pt; margin-bottom: 5pt">Response Example</h3>
                        <div style="font-family: 'Courier New', monospace; 
                                   background-color: #f5f5f5; 
                                   padding: 10pt; 
                                   white-space: pre-wrap"><pre>${formatValue(doc.responseExample, 'object')}</pre></div>
                    ` : ''}
                </div>`;
        }
    
        // Generate the complete Word document HTML
        const html = `
            <html xmlns:o='urn:schemas-microsoft-com:office:office' 
                  xmlns:w='urn:schemas-microsoft-com:office:word'
                  xmlns='http://www.w3.org/TR/REC-html40'>
            <head>
                <meta charset="utf-8">
                <title>API Documentation</title>
                <!--[if gte mso 9]>
                <xml>
                    <w:WordDocument>
                        <w:View>Print</w:View>
                        <w:Zoom>90</w:Zoom>
                        <w:DoNotOptimizeForBrowser/>
                    </w:WordDocument>
                </xml>
                <![endif]-->
                <style>
                    body { 
                        font-family: 'Calibri', sans-serif;
                        font-size: 11pt;
                        line-height: 1.3;
                    }
                    table { 
                        border-collapse: collapse;
                        width: 100%;
                        margin: 10pt 0;
                    }
                    th, td { 
                        border: 1pt solid #000;
                        padding: 5pt;
                        text-align: left;
                        vertical-align: top;
                    }
                    th { 
                        background-color: #f0f0f0;
                        font-weight: bold;
                    }
                </style>
            </head>
            <body>
                <h1 style="font-size: 16pt; margin-bottom: 20pt">API Documentation</h1>
                ${docs.map(doc => generateEndpointDoc(doc)).join('')}
            </body>
            </html>`;
    
        return html;
    }

    generateMarkdown(docs) {
        let md = '# API Documentation\n\n';
        
        for (const doc of docs) {
            md += this.generateEndpointMarkdown(doc);
            md += '\n---\n\n';
        }
        
        return md;
    }

    generateEndpointMarkdown(doc) {
        let md = `## ${doc.method} ${doc.path}\n\n`;
        
        md += `${doc.description}\n\n`;

        if (doc.notes) {
            md += '### Additional Notes\n\n';
            md += `${doc.notes}\n\n`;
        }
        
        if (doc.params && doc.params.length) {
            md += '### Request Parameters\n\n';
            md += '| Field | Type | Required | Description | Example | Notes |\n';
            md += '|-------|------|----------|-------------|---------|--------|\n';
            
            doc.params.forEach(param => {
                md += `| \`${param.name}\` | \`${param.type}\` | ${param.required ? '✓' : '✗'} | ${param.description} | \`${param.example}\` | ${param.notes || '-'} |\n`;
            });
            
            md += '\n';
        }
        
        if (doc.requestExample) {
            md += '### Request Example\n\n';
            md += '```json\n';
            md += `${doc.requestExample}\n`;
            md += '```\n\n';
        }
        
        if (doc.returns) {
            md += '### Response\n\n';
            md += `**Description:** ${doc.returns.description}\n\n`;
            
            if (doc.returns.fields && doc.returns.fields.length) {
                md += '#### Response Fields\n\n';
                md += '| Field | Type | Description | Example | Notes |\n';
                md += '|-------|------|-------------|---------|--------|\n';
                
                doc.returns.fields.forEach(field => {
                    md += `| \`${field.name}\` | \`${field.type}\` | ${field.description} | \`${field.example}\` | ${field.notes || '-'} |\n`;
                });
                
                md += '\n';
            }
        }
        
        if (doc.responseExample) {
            md += '### Response Example\n\n';
            md += '```json\n';
            md += `${doc.responseExample}\n`;
            md += '```\n\n';
        }
        
        return md;
    }

    escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
}