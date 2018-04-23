package de.eddies.role;

public enum Role
{
    /**
     * normale Besucher
     */
    GUEST(0),

    /**
     * Hallenwart, Putze, Theki
     */
    STUFF(1),

    /**
     * Datenbank-Admin
     */
    ADMIN(2);

    private int level = 0;

    private Role(int level)
    {
        this.level = level;
    }

    public int getLevel()
    {
        return this.level;
    }
}
