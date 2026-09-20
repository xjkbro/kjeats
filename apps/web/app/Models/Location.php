<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Location extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'display_name'];

    public static function boot()
    {
        parent::boot();

        static::creating(function ($location) {
            if (empty($location->display_name)) {
                $location->display_name = static::deriveDisplayName($location->name);
            }
        });
    }

    public function restaurants()
    {
        return $this->hasMany(Restaurant::class);
    }

    public function wantToTries()
    {
        return $this->hasMany(WantToTry::class);
    }

    public static function normalize(string $name): string
    {
        return trim(preg_replace('/\s+/', ' ', $name));
    }

    public static function deriveDisplayName(string $name): string
    {
        $normalized = static::normalize($name);
        $parts = explode(',', $normalized);

        return trim($parts[0]);
    }

    public static function findOrCreate(string $name): self
    {
        $normalized = static::normalize($name);

        return static::firstOrCreate(
            ['name' => $normalized],
            ['display_name' => static::deriveDisplayName($normalized)]
        );
    }

    public static function findSimilar(string $name, float $threshold = 0.8): ?self
    {
        $normalized = static::normalize(strtolower($name));
        $cleaned = preg_replace('/[^a-z0-9\s]/', '', $normalized);

        $similar = static::all()->filter(function (Location $location) use ($cleaned, $threshold) {
            $existing = preg_replace('/[^a-z0-9\s]/', '', strtolower(static::normalize($location->name)));

            return static::similarity($cleaned, $existing) >= $threshold;
        });

        if ($similar->isEmpty()) {
            return null;
        }

        $best = $similar->sortByDesc(function (Location $location) use ($cleaned) {
            $existing = preg_replace('/[^a-z0-9\s]/', '', strtolower(static::normalize($location->name)));

            return static::similarity($cleaned, $existing);
        })->first();

        return $best;
    }

    private static function similarity(string $a, string $b): float
    {
        if ($a === $b) {
            return 1.0;
        }

        if ($a === '' || $b === '') {
            return 0.0;
        }

        $lev = levenshtein($a, $b);
        $maxLen = max(strlen($a), strlen($b));

        return 1.0 - ($lev / $maxLen);
    }
}
