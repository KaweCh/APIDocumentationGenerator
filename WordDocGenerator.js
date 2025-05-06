class WordDocGenerator {
    // Helper method to safely stringify complex types
    formatValue(value, type) {
        if (!value) return '';
        
        if (type === 'array<object>' || type === 'object') {
            try {
                if (typeof value === 'string') {
                    // If it's already a string, try to parse and re-stringify for formatting
                    const parsed = JSON.parse(value);
                    return JSON.stringify(parsed, null, 2);
                }
                return JSON.stringify(value, null, 2);
            } catch (e) {
                return String(value);
            }
        }
        return String(value);
    }

    // Helper method to generate table rows for parameters
    generateParamsTable(params) {
        if (!params || !params.length) return '';
        
        return `
            <table>
                <tr>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Description</th>
                    <th>Required</th>
                    <th>Example</th>
                    <th>Notes</th>
                </tr>
                ${params.map(param => `
                    <tr>
                        <td>${param.name || ''}</td>
                        <td><code>${param.type || ''}</code></td>
                        <td>${param.description || ''}</td>
                        <td>${param.required ? 'Yes' : 'No'}</td>
                        <td><pre>${this.formatValue(param.example, param.type)}</pre></td>
                        <td>${param.notes || ''}</td>
                    </tr>
                `).join('')}
            </table>`;
    }

    // Helper method to generate table rows for return fields
    generateReturnsTable(returns) {
        if (!returns || !returns.fields) return '';
        
        return `
            <table>
                <tr>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Description</th>
                    <th>Required</th>
                    <th>Example</th>
                    <th>Notes</th>
                </tr>
                ${returns.fields.map(field => `
                    <tr>
                        <td>${field.name || ''}</td>
                        <td><code>${field.type || ''}</code></td>
                        <td>${field.description || ''}</td>
                        <td>${field.required ? 'Yes' : 'No'}</td>
                        <td><pre>${this.formatValue(field.example, field.type)}</pre></td>
                        <td>${field.notes || ''}</td>
                    </tr>
                `).join('')}
            </table>`;
    }

    // Method to generate documentation for a single endpoint
    generateEndpointDoc(doc) {
        return `
            <div class="endpoint">
                <h2>
                    <span class="method ${doc.method.toLowerCase()}">${doc.method}</span>
                    ${doc.path}
                </h2>
                <p>${doc.description || ''}</p>
                
                ${doc.notes ? `
                    <h3>Notes:</h3>
                    <ul>
                        ${doc.notes.split('\n').map(note => `<li>${note.replace(/^-\s*/, '')}</li>`).join('')}
                    </ul>
                ` : ''}
                
                <h3>Request Parameters</h3>
                ${this.generateParamsTable(doc.params)}
                
                <h3>Response</h3>
                ${this.generateReturnsTable(doc.returns)}
                
                ${doc.requestExample ? `
                    <h3>Request Example</h3>
                    <pre>${this.formatValue(doc.requestExample, 'object')}</pre>
                ` : ''}
                
                ${doc.responseExample ? `
                    <h3>Response Example</h3>
                    <pre>${this.formatValue(doc.responseExample, 'object')}</pre>
                ` : ''}
            </div>`;
    }

    // Main method to generate the complete Word document
    generateWord(docs) {
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
                    }
                    .endpoint { 
                        margin-bottom: 20pt;
                        page-break-inside: avoid;
                    }
                    table { 
                        border-collapse: collapse;
                        width: 100%;
                        margin: 10pt 0;
                        table-layout: fixed;
                    }
                    th, td { 
                        border: 1pt solid #000;
                        padding: 5pt;
                        text-align: left;
                        vertical-align: top;
                        word-wrap: break-word;
                        max-width: 200pt;
                        overflow: hidden;
                    }
                    th { 
                        background-color: #f0f0f0;
                        font-weight: bold;
                    }
                    pre {
                        white-space: pre-wrap;
                        word-wrap: break-word;
                        font-size: 9pt;
                        font-family: 'Courier New', monospace;
                        background-color: #f5f5f5;
                        padding: 5pt;
                        margin: 5pt 0;
                        max-width: 100%;
                        overflow-x: auto;
                    }
                    code {
                        font-family: 'Courier New', monospace;
                        background-color: #f5f5f5;
                        padding: 1pt 3pt;
                        font-size: 10pt;
                    }
                    .method {
                        padding: 2pt 5pt;
                        color: white;
                        font-weight: bold;
                        display: inline-block;
                        margin-right: 5pt;
                    }
                    .method.get { background-color: #61affe; }
                    .method.post { background-color: #49cc90; }
                    .method.put { background-color: #fca130; }
                    .method.delete { background-color: #f93e3e; }
                </style>
            </head>
            <body>
                <h1>API Documentation</h1>
                ${docs.map(doc => this.generateEndpointDoc(doc)).join('')}
            </body>
            </html>`;

        return html;
    }
}

