package de.eddies.session;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

/**
 *
 */
class PasswordUtil
{
    /**
     * 
     * @param passwd
     * @return
     * @throws NoSuchAlgorithmException
     */
    public static String hashPassword(String passwd) throws NoSuchAlgorithmException
    {
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        digest.reset();
        byte[] hash = digest.digest(passwd.getBytes());

        StringBuilder result = new StringBuilder();
        for (byte b : hash)
        {
            if (b < 0)
            {
                b += 128;
            }
            result.append(String.format("%1$02x", b));
        }
        return result.toString().toUpperCase();
    }
}
