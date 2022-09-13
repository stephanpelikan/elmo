package at.elmo.util.spring;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;

import org.springframework.core.io.InputStreamResource;

public class AutoDeleteFileAfterDownloadResource extends InputStreamResource {

    static class AutoDeleteFileAfterReadInputStream extends FileInputStream {

        private File file;

        public AutoDeleteFileAfterReadInputStream(
                final File file) throws IOException {
            
            super(file);
            this.file = file;
            
        }
        
        @Override
        public void close() throws IOException {

            super.close();
            file.delete();

        }

    };
    
    public AutoDeleteFileAfterDownloadResource(
            final File file) throws IOException {
        
        super(new AutoDeleteFileAfterReadInputStream(file));
        
    }
    
}
