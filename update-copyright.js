const fs = require('fs');
const path = require('path');

// Function to update copyright text in a file
function updateCopyrightInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if the file has the old copyright text
    if (content.includes('2025-09-02 EgyField. All rights reserved') || 
        content.includes('2025-09-02 EgyField. جميع الحقوق محفوظة')) {
      
      // Replace the old copyright text with the new one
      content = content.replace(
        /©\s*2025-09-02\s*EgyField\.\s*All rights reserved\.?/g, 
        '© EgyField. All rights reserved.'
      );
      
      content = content.replace(
        /©\s*2025-09-02\s*EgyField\.\s*جميع الحقوق محفوظة\.?/g, 
        '© EgyField. جميع الحقوق محفوظة.'
      );
      
      // Write the updated content back to the file
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
    return false;
  }
}

// Function to process all HTML files in a directory recursively
function processDirectory(directory) {
  const files = fs.readdirSync(directory);
  let updatedCount = 0;
  
  files.forEach(file => {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      // Skip node_modules and other non-essential directories
      if (!['node_modules', '.git', '.github', '.vscode', 'dist', 'build'].includes(file)) {
        updatedCount += processDirectory(fullPath);
      }
    } else if (path.extname(file).toLowerCase() === '.html') {
      if (updateCopyrightInFile(fullPath)) {
        updatedCount++;
      }
    }
  });
  
  return updatedCount;
}

// Start processing from the current directory
const rootDir = __dirname;
console.log('Updating copyright text in HTML files...');
const filesUpdated = processDirectory(rootDir);
console.log(`\nUpdate complete! ${filesUpdated} files were updated.`);
