package at.elmo.util.spring;

import java.io.File;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class FileCleanupInterceptor implements HandlerInterceptor {

    private static ThreadLocal<File> toBeDeleted = new ThreadLocal<>();

    public static void setDownloadFile(
            final File file) {
        
        toBeDeleted.set(file);
        
    }
    
    @Override
    public void afterCompletion(
            final HttpServletRequest request,
            final HttpServletResponse response,
            final Object handler,
            final Exception ex)
            throws Exception {
        
        if (toBeDeleted.get() != null) {
            toBeDeleted.get().delete();
            toBeDeleted.remove();
        }
        
    }
    
}
